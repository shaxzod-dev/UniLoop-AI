import assert from "node:assert/strict";
import fs from "node:fs";

// Use a separately launched headless Chrome profile and a confirmed disposable backend.
assert.equal(process.env.SMOKE_DISPOSABLE, "true");
const origin = process.env.BROWSER_ORIGIN ?? "http://localhost:3001";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(origin).hostname));
const targets = await (await fetch("http://127.0.0.1:9223/json/list")).json();
const target = targets.find((target) => target.type === "page");
assert.ok(target?.webSocketDebuggerUrl);
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let sequence = 0;
const pending = new Map();
const exceptions = [];
const network = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const entry = pending.get(message.id);
    if (entry) {
      clearTimeout(entry.timer);
      pending.delete(message.id);
      if (message.error) entry.reject(new Error(message.error.message));
      else entry.resolve(message.result);
    }
  }
  if (message.method === "Runtime.exceptionThrown")
    exceptions.push(message.params.exceptionDetails.text);
  if (
    message.method === "Network.responseReceived" &&
    message.params.response.url.startsWith("http://localhost:5001/api/v1")
  )
    network.push({
      path: new URL(message.params.response.url).pathname,
      status: message.params.response.status,
    });
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("CDP command timed out: " + method));
    }, 15000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error("Browser evaluation failed");
  return result.result.value;
}
async function until(expression, label) {
  const started = Date.now();
  while (Date.now() - started < 15000) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("Browser wait failed: " + label);
}
const directory = fs.mkdtempSync("/private/tmp/uniloop-phase9-screens-");
async function screenshot(name) {
  const result = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(
    directory + "/" + name + ".png",
    Buffer.from(result.data, "base64"),
  );
}
async function navigate(route, expected = route) {
  await send("Page.navigate", { url: origin + route });
  await until(
    `location.pathname === ${JSON.stringify(expected)} && !!document.querySelector('#main-content h1') && !document.querySelector('[aria-busy="true"]')`,
    route,
  );
  const state = await evaluate(
    `({width:innerWidth,overflow:document.documentElement.scrollWidth,text:document.querySelector('#main-content').innerText})`,
  );
  assert.ok(
    state.overflow <= state.width + 1,
    "Horizontal overflow on " + route,
  );
  assert.ok(
    !state.text.includes("Ma’lumotni yuklab bo‘lmadi") &&
      !state.text.includes("Kutilmagan xatolik yuz berdi."),
    "Application error state on " + route,
  );
}
async function signIn(email, path) {
  await send("Page.navigate", { url: origin + "/login" });
  await until(
    `document.readyState === 'complete' && !!document.querySelector('#login-email') && Object.keys(document.querySelector('#login-email')).some(key => key.startsWith('__reactProps'))`,
    "hydrated real login form",
  );
  await evaluate(
    `(() => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; const email = document.querySelector('#login-email'), password = document.querySelector('#login-password'); email.focus(); set.call(email, ${JSON.stringify(email)}); email.dispatchEvent(new Event('input',{bubbles:true})); email.dispatchEvent(new Event('change',{bubbles:true})); email.blur(); password.focus(); set.call(password, 'password123'); password.dispatchEvent(new Event('input',{bubbles:true})); password.dispatchEvent(new Event('change',{bubbles:true})); password.blur(); return true; })()`,
  );
  await evaluate(`document.querySelector('form').requestSubmit(); true`);
  await until(
    `location.pathname === ${JSON.stringify(path)} && !!document.querySelector('#main-content h1') && !document.querySelector('[aria-busy="true"]')`,
    "backend login",
  );
}
const studentRoutes = [
  "/student/dashboard",
  "/student/courses",
  "/student/courses/course-programming",
  "/student/assessments/assessment-follow-up",
  "/student/mastery/course-programming",
  "/student/learning-plan/course-programming",
  "/student/opportunities",
  "/student/surveys",
];
const professorRoutes = [
  "/professor/dashboard",
  "/professor/courses",
  "/professor/courses/course-programming",
  "/professor/courses/course-programming/assessments",
  "/professor/courses/course-programming/insights",
  "/professor/courses/course-programming/interventions",
  "/professor/referrals",
  "/professor/growth-plan",
  "/professor/surveys",
];
try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: origin + "/login" });
  await until(`!!document.querySelector('#login-email')`, "initial login");
  await screenshot("desktop-login");
  await signIn("student1@uniloop.local", "/student/dashboard");
  assert.ok(
    (await evaluate("document.body.innerText")).includes("Dilnoza Karimova"),
  );
  await navigate("/student/dashboard");
  await screenshot("desktop-student-dashboard");
  await navigate("/student/mastery/course-programming");
  await screenshot("desktop-student-mastery");
  await navigate("/student/learning-plan/course-programming");
  await screenshot("desktop-student-learning-plan");
  const before = network.length;
  await send("Page.reload");
  await until(
    `!!document.querySelector('#main-content h1') && !document.querySelector('[aria-busy="true"]')`,
    "refresh hydration",
  );
  assert.ok(
    network
      .slice(before)
      .some(
        (response) =>
          response.path.endsWith("/auth/me") && response.status === 200,
      ),
    "Refresh uses backend identity",
  );
  for (const route of studentRoutes) await navigate(route);
  await navigate("/professor/dashboard", "/student/dashboard");
  await navigate("/student/assessments/assessment-follow-up");
  await evaluate(
    `(() => { document.querySelectorAll('input[type="radio"][value="option-right"]').forEach(input => input.click()); return true; })()`,
  );
  await evaluate(
    `document.querySelector('#main-content form').requestSubmit(); true`,
  );
  await until(
    `!document.querySelector('#main-content form') && document.querySelector('#main-content').innerText.includes('100%')`,
    "browser assessment grading",
  );
  await screenshot("desktop-assessment-result");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 768,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: false,
  });
  for (const route of studentRoutes) await navigate(route);
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  for (const route of studentRoutes) await navigate(route);
  await navigate("/student/opportunities");
  await screenshot("mobile-student-opportunities");
  // Exercise real UI logout, not a production identity shortcut.
  await evaluate(
    `document.querySelector('button[data-slot="sheet-trigger"]').click(); true`,
  );
  await until(
    `[...document.querySelectorAll('button')].some(button => button.textContent.trim() === 'Chiqish')`,
    "mobile navigation",
  );
  await screenshot("mobile-navigation");
  assert.ok(
    await evaluate(
      `!!document.querySelector('[role="dialog"]') && document.querySelector('[role="dialog"]').contains(document.activeElement)`,
    ),
    "Mobile dialog manages keyboard focus",
  );
  await evaluate(
    `(() => { const button = [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Chiqish'); button.click(); return true; })()`,
  );
  await until(
    `location.pathname === '/login' && !!document.querySelector('#login-email')`,
    "logout",
  );
  await signIn("professor@uniloop.local", "/professor/dashboard");
  assert.ok(
    (await evaluate("document.body.innerText")).includes("Azizbek Rahmonov"),
  );
  for (const route of professorRoutes) await navigate(route);
  await navigate("/professor/courses/course-programming/insights");
  await screenshot("mobile-professor-insights");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 768,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: false,
  });
  for (const route of professorRoutes) await navigate(route);
  await screenshot("tablet-professor-surveys");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false,
  });
  for (const route of professorRoutes) await navigate(route);
  await navigate("/professor/courses/course-programming/insights");
  await screenshot("desktop-professor-insights");
  await navigate("/professor/courses/course-programming/interventions");
  await screenshot("desktop-professor-interventions");
  await navigate("/professor/referrals");
  await screenshot("desktop-professor-referrals");
  assert.deepEqual(exceptions, [], "No unhandled browser exceptions");
  assert.ok(
    network.some(
      (response) =>
        response.path.endsWith("/auth/login") && response.status === 201,
    ),
  );
  assert.ok(
    network.some(
      (response) =>
        response.path.endsWith("/submissions") && response.status === 201,
    ),
  );
  assert.ok(
    network.every((response) => response.status < 400),
    "All browser API requests succeeded through CORS",
  );
  console.log(
    "PASS: all 17 protected routes at 390/768/1440 widths, real form login for both roles, refresh /auth/me, wrong-role redirect, answer submission, dialog focus, logout, browser CORS and no horizontal overflow/unhandled exceptions.",
  );
  console.log("Screenshots: " + directory);
} finally {
  socket.close();
}
