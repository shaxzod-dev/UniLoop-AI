## UniLoop AI

UniLoop AI talabalarning o‘qishi, dalillari va kasbiy rivojlanishini uzluksiz qo‘llab-quvvatlaydigan sun’iy intellektga tayyor ta’lim tizimidir.

### Texnologiyalar

- Next.js App Router, React va TypeScript
- Tailwind CSS 4 va shadcn/ui
- TanStack Query, Zod, React Hook Form va Zustand
- Recharts, Lucide React va date-fns

### Mahalliy ishga tushirish

Node.js LTS o‘rnatilgan bo‘lishi kerak.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Brauzerda [http://localhost:3000](http://localhost:3000) manzilini oching.

Sifat tekshiruvlari:

```bash
npm run lint
npm run validate:data
npx tsc --noEmit
npm run build
```

### Muhit o‘zgaruvchilari

| O‘zgaruvchi                        | Tavsif                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_USE_MOCKS`            | Mock rejimini yoqadi yoki o‘chiradi.                                                 |
| `NEXT_PUBLIC_MOCK_SCENARIO`        | `populated`, `empty`, `error` yoki `surveyUnavailable`; standart qiymat `populated`. |
| `NEXT_PUBLIC_API_URL`              | NestJS backend manzili; standart qiymat `http://localhost:5001/api/v1`.              |
| `NEXT_PUBLIC_STUDENT_SURVEY_URL`   | Talabalar so‘rovnomasi manzili; hozircha bo‘sh bo‘lishi mumkin.                      |
| `NEXT_PUBLIC_PROFESSOR_SURVEY_URL` | Professor-o‘qituvchilar so‘rovnomasi manzili; hozircha bo‘sh bo‘lishi mumkin.        |

### Loyihalash qoidalari

Kod identifikatorlari ingliz tilida, foydalanuvchiga ko‘rinadigan barcha matnlar esa markazlashtirilgan Uzbek Latin lokalizatsiyasida saqlanadi. UI bir xil typed API qatlam orqali mock yoki haqiqiy HTTP transportidan foydalanadi.

### Hozirgi holat

Phase 1–7 dizayn, rollar, typed domen modellari, talabalar va professorlar akademik jarayonlari, kasbiy imkoniyatlar hamda so‘rovnomalarni yaratdi. Phase 8 haqiqiy NestJS autentifikatsiyasi, serverda baholash, o‘zlashtirish dalillari, o‘quv rejasi, kohort tahlili, kasbiy profil va rozilikka asoslangan professor tavsiyalarini PostgreSQL bilan uladi.

Joriy yo‘nalishlar, DTOlar, cheklovlar va tekshiruv buyruqlari: [frontend API shartnomasi](docs/frontend-api-contract.md). Mock mutatsiyalar xotirada saqlanadi; sahifani to‘liq yangilash boshlang‘ich ma’lumotlarni tiklaydi. HTTP rejimida ma’lumotlar backendda saqlanadi, sessiya esa token bilan tiklanadi.

Haqiqiy backend uchun `NEXT_PUBLIC_USE_MOCKS=false` va `NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1` qiymatlarini serverni boshlashdan yoki builddan oldin belgilang. `NEXT_PUBLIC_*` qiymatlari build vaqtida biriktiriladi. Backend CORS sozlamasi frontend manziliga mos bo‘lishi kerak. Backendning `docs/api-v1.md` hujjatida xavfsiz, faqat bo‘sh va disposable bazaga mo‘ljallangan seed tartibi berilgan. Seed hisoblari: `student1@uniloop.local` va `professor@uniloop.local`; faqat mahalliy demo paroli: `password123`.

Avtomatik materialdan outcome/assessment yaratish hozircha aniq unavailable holatini qaytaradi. Gemini va S3 ixtiyoriy; real provider sozlanmaganida AI deterministik fallback qaytaradi. Soxta AI natijalari, baholar yoki loyiha dalillari qo‘shilmaydi.

Ma’lum sandbox Turbopack worker ruxsati muammosi yuz bersa, `npm run build -- --webpack` orqali ishlab chiqarish buildini tekshiring.

Haqiqiy backend smoke testi: `SMOKE_DISPOSABLE=true node scripts/validate-backend.mjs`. Bu test faqat disposable mahalliy backend ma’lumotlarini o‘zgartiradi.

Taqdimot, xavfsiz migration/seed qoidalari, real va mock rejimlari hamda nosozliklarni bartaraf etish: [Phase 9 demo runbook](docs/demo-runbook.md) va [yakuniy QA dalillari](docs/phase9-qa.md).
