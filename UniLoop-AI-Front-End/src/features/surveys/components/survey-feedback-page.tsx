"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const usageOptions = [
  "Daily",
  "Several times a week",
  "Weekly",
  "Occasionally",
  "This is my first time",
];
const likesOptions = [
  "Saves time",
  "Helps organize tasks",
  "Improves productivity",
  "Helps with studying",
  "Makes communication easier",
  "Helps professors manage their work",
  "AI assistance is useful",
  "Easy to use",
  "Personalized recommendations",
  "Other",
];
const problemOptions = [
  "Some features are difficult to understand",
  "AI responses could be better",
  "Interface could be improved",
  "Some features are slow",
  "Not enough personalization",
  "Missing important features",
  "Notifications are distracting",
  "Difficult to integrate into my existing workflow",
  "Other",
];
const productivityOptions = [
  "Significantly improved",
  "Improved",
  "No significant change",
  "Slightly decreased",
  "Significantly decreased",
];
const timeSavedOptions = [
  "Less than 1 hour",
  "1–3 hours",
  "3–5 hours",
  "5–10 hours",
  "More than 10 hours",
];
const futureFeatureOptions = [
  "AI study planner",
  "AI lesson planner for teachers",
  "Automatic task prioritization",
  "Calendar integration",
  "Student progress analytics",
  "Professor workload analytics",
  "AI-generated study materials",
  "Peer/community networking",
  "Job and internship recommendations",
  "More integrations",
  "Other",
];
const featureRatingOptions = [
  "AI Assistant",
  "Task & Schedule Management",
  "Personalized Study/Work Plans",
  "Academic Progress Tracking",
  "Communication Tools",
  "Recommendations",
  "Teacher Productivity Tools",
];

const feedbackCards = [
  {
    name: "Aisha Khan",
    faculty: "Computer Science",
    type: "Student",
    rating: 5,
    sentiment: "Positive",
    helpful: 91,
    date: "2 days ago",
    quote:
      "The AI study planner helps me prioritize my assignments and keeps my week on track. It feels much easier to stay focused when deadlines are visualized clearly.",
  },
  {
    name: "Daniel Rodriguez",
    faculty: "Engineering",
    type: "Student",
    rating: 4,
    sentiment: "Positive",
    helpful: 78,
    date: "5 days ago",
    quote:
      "I like the recommendations and task tracking, but I would like more customization in how my weekly goals are organized. Overall it saves me time.",
  },
  {
    name: "Priya Nair",
    faculty: "Business",
    type: "Professor",
    rating: 4,
    sentiment: "Needs Improvement",
    helpful: 63,
    date: "1 week ago",
    quote:
      "It has reduced coordination effort, but the dashboard could feel less crowded. Some teaching workflows still need better automation and clearer follow-ups.",
  },
  {
    name: "Samuel Lee",
    faculty: "Mathematics",
    type: "Professor",
    rating: 5,
    sentiment: "Positive",
    helpful: 88,
    date: "3 days ago",
    quote:
      "The workload insights and planning support have been genuinely useful. I can identify bottlenecks earlier and keep my course rhythm more consistent.",
  },
  {
    name: "Maya Hassan",
    faculty: "Psychology",
    type: "Student",
    rating: 3,
    sentiment: "Needs Improvement",
    helpful: 52,
    date: "4 days ago",
    quote:
      "The platform is useful, but some features still feel a bit slow. More personalization would help me tailor it to my learning style and study habits.",
  },
];

const insightBars = [
  { label: "5★", value: 52 },
  { label: "4★", value: 31 },
  { label: "3★", value: 11 },
  { label: "2★", value: 4 },
  { label: "1★", value: 2 },
];

export function SurveyFeedbackPage() {
  const [helpfulRating, setHelpfulRating] = useState<number | null>(4);
  const [frequency, setFrequency] = useState<string>("Several times a week");
  const [selectedLikes, setSelectedLikes] = useState<string[]>([
    "Saves time",
    "Improves productivity",
  ]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([
    "AI responses could be better",
  ]);
  const [otherLike, setOtherLike] = useState("");
  const [otherProblem, setOtherProblem] = useState("");
  const [productivityImpact, setProductivityImpact] = useState("Improved");
  const [timeSaved, setTimeSaved] = useState("1–3 hours");
  const [featureRatings, setFeatureRatings] = useState<Record<string, number>>({
    "AI Assistant": 5,
    "Task & Schedule Management": 4,
    "Personalized Study/Work Plans": 5,
    "Academic Progress Tracking": 4,
    "Communication Tools": 3,
    Recommendations: 4,
    "Teacher Productivity Tools": 4,
  });
  const [selectedFutureFeatures, setSelectedFutureFeatures] = useState<string[]>([
    "AI study planner",
    "Calendar integration",
  ]);
  const [futureOther, setFutureOther] = useState("");
  const [openFeedback, setOpenFeedback] = useState(
    "A clearer summary view for my weekly progress would make this even more useful.",
  );
  const [recommendation, setRecommendation] = useState(8);
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const currentStep = 2;

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return feedbackCards.filter((card) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Most Helpful" && card.helpful >= 80) ||
        (filter === "Students" && card.type === "Student") ||
        (filter === "Professors" && card.type === "Professor") ||
        (filter === "Positive" && card.sentiment === "Positive") ||
        (filter === "Needs Improvement" && card.sentiment === "Needs Improvement");

      const matchesSearch =
        query.length === 0 ||
        card.name.toLowerCase().includes(query) ||
        card.faculty.toLowerCase().includes(query) ||
        card.quote.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  const toggleSelection = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const handleSubmit = () => {
    if (!helpfulRating || !frequency || !productivityImpact || !timeSaved || !recommendation) {
      setError("Please complete the required survey sections before submitting.");
      return;
    }

    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-primary/10 bg-linear-to-br from-white via-primary/5 to-violet-50 shadow-[0_18px_45px_rgba(15,42,74,0.06)]">
        <div className="flex flex-col gap-6 p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="mb-3 bg-primary/10 text-primary" variant="secondary">
                <Sparkles className="mr-1 size-3.5" />
                Product feedback
              </Badge>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-(--navy) sm:text-4xl lg:text-5xl">
                Your Feedback Matters
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Help us improve the way students and professors learn, work, and stay productive.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Survey progress
              </p>
              <div className="mt-3 flex items-center justify-between gap-6">
                <div>
                  <p className="text-xl font-semibold text-(--navy)">Step {currentStep} of 5</p>
                  <p className="text-xs text-muted-foreground">Quick feedback form</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="size-5" />
                </div>
              </div>
              <Progress className="mt-4 h-2" value={40} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Average satisfaction</p>
              <p className="mt-3 font-heading text-3xl font-semibold text-(--navy)">4.7/5</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Students surveyed</p>
              <p className="mt-3 font-heading text-3xl font-semibold text-(--navy)">15</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Productivity gains</p>
              <p className="mt-3 font-heading text-3xl font-semibold text-(--navy)">86%</p>
            </div>
          </div>
        </div>
      </section>

      {!submitted ? (
        <div className="space-y-6">
          <Card className="overflow-hidden border border-border/80 shadow-[0_10px_30px_rgba(15,42,74,0.04)]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Your feedback</p>
                  <h2 className="mt-1 text-xl font-semibold text-(--navy)">We’d love to hear about your experience</h2>
                </div>
                <Sparkles className="size-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/80 shadow-[0_10px_30px_rgba(15,42,74,0.04)]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Overall experience</p>
                  <h2 className="mt-1 text-xl font-semibold text-(--navy)">
                    How helpful has our platform been for you?
                  </h2>
                </div>
                <Star className="size-5 text-primary" />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setHelpfulRating(value)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40",
                      helpfulRating === value
                        ? "border-primary bg-primary/8 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    <Star className={cn("size-4", helpfulRating !== null && helpfulRating >= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                    <span>{value}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Not helpful</span>
                <span>Extremely helpful</span>
              </div>

              <div className="mt-6">
                <label className="mb-3 block text-sm font-medium text-foreground">
                  How often do you use the platform?
                </label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {usageOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFrequency(option)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all hover:border-primary/30 hover:bg-primary/5",
                        frequency === option
                          ? "border-primary bg-primary/6 text-primary shadow-sm"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/80 shadow-[0_10px_30px_rgba(15,42,74,0.04)]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Advantages</p>
                  <h2 className="mt-1 text-xl font-semibold text-(--navy)">
                    What do you like most about the platform?
                  </h2>
                </div>
                <ThumbsUp className="size-5 text-primary" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {likesOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleSelection(option, selectedLikes, setSelectedLikes)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40",
                      selectedLikes.includes(option)
                        ? "border-primary bg-primary/8 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {selectedLikes.includes("Other") && (
                <textarea
                  value={otherLike}
                  onChange={(event) => setOtherLike(event.target.value)}
                  placeholder="Tell us more about what you found useful..."
                  className="mt-4 min-h-24 w-full rounded-2xl border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/30"
                />
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/80 shadow-[0_10px_30px_rgba(15,42,74,0.04)]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Disadvantages</p>
                  <h2 className="mt-1 text-xl font-semibold text-(--navy)">
                    What could be improved?
                  </h2>
                </div>
                <MessageSquareText className="size-5 text-primary" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {problemOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleSelection(option, selectedProblems, setSelectedProblems)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40",
                      selectedProblems.includes(option)
                        ? "border-primary bg-primary/8 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {selectedProblems.includes("Other") && (
                <textarea
                  value={otherProblem}
                  onChange={(event) => setOtherProblem(event.target.value)}
                  placeholder="What problems did you experience?"
                  className="mt-4 min-h-24 w-full rounded-2xl border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/30"
                />
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/80 shadow-[0_10px_30px_rgba(15,42,74,0.04)]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Productivity impact</p>
                  <h2 className="mt-1 text-xl font-semibold text-(--navy)">
                    How has the platform affected your productivity?
                  </h2>
                </div>
                <TrendingUp className="size-5 text-primary" />
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {productivityOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setProductivityImpact(option)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left text-sm transition-all hover:border-primary/30 hover:bg-primary/5",
                      productivityImpact === option
                        ? "border-primary bg-primary/6 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="mb-3 block text-sm font-medium text-foreground">
                  Approximately how much time does the platform save you per week?
                </label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {timeSavedOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTimeSaved(option)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm transition-all hover:border-primary/30 hover:bg-primary/5",
                        timeSaved === option
                          ? "border-primary bg-primary/6 text-primary shadow-sm"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/80 shadow-[0_10px_30px_rgba(15,42,74,0.04)]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Most useful features</p>
                  <h2 className="mt-1 text-xl font-semibold text-(--navy)">
                    Rate the features you use most
                  </h2>
                </div>
                <BarChart3 className="size-5 text-primary" />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {featureRatingOptions.map((feature) => (
                  <div key={feature} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">{feature}</p>
                      <span className="text-xs text-muted-foreground">
                        {featureRatings[feature] ?? 0}/5
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() =>
                            setFeatureRatings((current) => ({
                              ...current,
                              [feature]: starValue,
                            }))
                          }
                          className={cn(
                            "rounded-full border p-1.5 transition-all",
                            (featureRatings[feature] ?? 0) >= starValue
                              ? "border-yellow-300 bg-yellow-50 text-yellow-500"
                              : "border-border bg-background text-muted-foreground",
                          )}
                          aria-label={`${feature} rating ${starValue}`}
                        >
                          <Star className={cn("size-4", (featureRatings[feature] ?? 0) >= starValue ? "fill-current" : "") } />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/80 shadow-[0_10px_30px_rgba(15,42,74,0.04)]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Future features</p>
                  <h2 className="mt-1 text-xl font-semibold text-(--navy)">
                    What would you like us to add next?
                  </h2>
                </div>
                <Sparkles className="size-5 text-primary" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {futureFeatureOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleSelection(option, selectedFutureFeatures, setSelectedFutureFeatures)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40",
                      selectedFutureFeatures.includes(option)
                        ? "border-primary bg-primary/8 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {selectedFutureFeatures.includes("Other") && (
                <textarea
                  value={futureOther}
                  onChange={(event) => setFutureOther(event.target.value)}
                  placeholder="Tell us what else you would like to see..."
                  className="mt-4 min-h-24 w-full rounded-2xl border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/30"
                />
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/80 shadow-[0_10px_30px_rgba(15,42,74,0.04)]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Open feedback</p>
                  <h2 className="mt-1 text-xl font-semibold text-(--navy)">
                    Anything else you would like us to know?
                  </h2>
                </div>
                <MessageSquareText className="size-5 text-primary" />
              </div>
              <textarea
                value={openFeedback}
                onChange={(event) => setOpenFeedback(event.target.value)}
                placeholder="Share your ideas, suggestions, or experiences with us..."
                className="mt-5 min-h-32 w-full rounded-2xl border border-border bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/30"
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/80 shadow-[0_10px_30px_rgba(15,42,74,0.04)]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Recommendation</p>
                  <h2 className="mt-1 text-xl font-semibold text-(--navy)">
                    How likely are you to recommend this platform to another student or professor?
                  </h2>
                </div>
                <Clock3 className="size-5 text-primary" />
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>0 = Not likely</span>
                  <span className="font-medium text-(--navy)">{recommendation}/10</span>
                  <span>10 = Very likely</span>
                </div>
                <div className="grid grid-cols-11 gap-2">
                  {Array.from({ length: 11 }, (_, index) => index).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRecommendation(value)}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-xs font-medium transition-all hover:border-primary/30",
                        recommendation === value
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Your feedback is anonymous and will help shape future product improvements.
            </p>
            <Button onClick={handleSubmit} size="lg" className="w-full sm:w-auto">
              Submit Feedback
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden border border-emerald-200 bg-emerald-50/70 shadow-[0_14px_35px_rgba(16,185,129,0.12)]">
          <CardContent className="flex flex-col items-center justify-center gap-5 p-8 text-center sm:p-10">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-semibold text-emerald-900">Thank you for your feedback!</h2>
              <p className="mt-3 max-w-xl text-base text-emerald-800/80">
                Your feedback helps us build a better learning and productivity experience.
              </p>
            </div>
            <Button variant="secondary" onClick={() => setSubmitted(false)}>
              Submit another response
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Community insights</p>
            <h2 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-(--navy)">
              See What Students Are Saying
            </h2>
          </div>

          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-sm">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search feedback..."
              className="w-full border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "All",
            "Most Helpful",
            "Students",
            "Professors",
            "Positive",
            "Needs Improvement",
          ].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                filter === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredCards.map((card) => (
              <Card key={`${card.name}-${card.date}`} className="border border-border/80 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" className="bg-primary/10 text-primary">
                        <AvatarFallback>{card.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{card.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{card.faculty}</p>
                      </div>
                    </div>
                    <Badge variant={card.type === "Student" ? "default" : "secondary"}>{card.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {Array.from({ length: card.rating }, (_, index) => (
                        <Star key={`${card.name}-star-${index}`} className="size-3.5 fill-current" />
                      ))}
                    </div>
                    <Badge
                      variant={card.sentiment === "Positive" ? "default" : "outline"}
                      className={cn(card.sentiment === "Positive" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}
                    >
                      {card.sentiment}
                    </Badge>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">“{card.quote}”</p>

                  <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                    <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      <ThumbsUp className="size-4" />
                      Helpful ({card.helpful})
                    </button>
                    <span className="text-xs text-muted-foreground">{card.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-(--navy)">
                <BarChart3 className="size-5 text-primary" />
                User Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Average satisfaction</p>
                  <p className="mt-2 font-heading text-3xl font-semibold text-(--navy)">4.7/5</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Productivity increase</p>
                  <p className="mt-2 font-heading text-3xl font-semibold text-(--navy)">86%</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Avg time saved</p>
                  <p className="mt-2 font-heading text-3xl font-semibold text-(--navy)">4.2h</p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Would recommend</p>
                  <p className="mt-2 font-heading text-3xl font-semibold text-(--navy)">91%</p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-foreground">Satisfaction distribution</p>
                <div className="space-y-3">
                  {insightBars.map((bar) => (
                    <div key={bar.label} className="grid grid-cols-[42px_1fr_42px] items-center gap-3">
                      <span className="text-xs text-muted-foreground">{bar.label}</span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-primary to-violet-500"
                          style={{ width: `${bar.value}%` }}
                        />
                      </div>
                      <span className="text-right text-xs text-muted-foreground">{bar.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
