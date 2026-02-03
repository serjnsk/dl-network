# 📜 Project Constitution — gemini.md

> **Это закон проекта.** Все изменения схем, правил и архитектуры фиксируются здесь.

---

## 🎯 North Star

**Создать масштабируемый дашборд для управления 100+ статическими сайтами** с возможностью:
- Быстрого создания проектов на основе шаблонов
- Редактирования контента через WYSIWYG
- Публикации через Cloudflare Pages с custom domains

---

## 📊 Data Schemas

### Entities Overview

```
DASHBOARD (Next.js) → manages → PROJECTS
PROJECT → uses → TEMPLATE
PROJECT → has → DOMAIN
PROJECT → stores → PROJECT_CONTENT
TEMPLATE → has → DESIGN_FILE + TEMPLATE_PAGES
TEMPLATE_PAGE → contains → PAGE_BLOCKS (ordered)
BLOCK → universal component (hero, features, cta, footer)
```

### Project Schema

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string (unique)",
  "template_id": "uuid",
  "domain_id": "uuid",
  "cf_project_id": "string | null",
  "cf_deployment_url": "string | null",
  "status": "draft | building | published | failed",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Template Schema

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string (unique)",
  "design_file_id": "uuid",
  "is_active": "boolean",
  "pages": [
    {
      "slug": "home",
      "title": "Главная",
      "order": 0,
      "blocks": [
        { "type": "hero", "order": 0, "default_content": {} },
        { "type": "features", "order": 1, "default_content": {} }
      ]
    }
  ]
}
```

### Block Content Schema (per block type)

```json
{
  "hero": {
    "title": "string",
    "subtitle": "string",
    "button_text": "string",
    "button_url": "string",
    "background_image": "url"
  },
  "features": {
    "title": "string",
    "items": [
      { "icon": "string", "title": "string", "description": "string" }
    ]
  },
  "cta": {
    "title": "string",
    "description": "string",
    "button_text": "string",
    "button_url": "string"
  },
  "footer": {
    "copyright": "string",
    "links": [{ "text": "string", "url": "string" }]
  }
}
```

---

## 🔗 Integrations

| Service | Status | Purpose |
|---------|--------|---------|
| Supabase | ⏳ Setup | Database, Auth, Storage |
| Cloudflare Pages | ⏳ Setup | Deploy, DNS, Domains |
| Google Stitch | ⏳ Setup | CSS import for templates |

---

## 📍 Source of Truth

| Data Type | Location |
|-----------|----------|
| Projects, Content | Supabase (PostgreSQL) |
| Templates definition | Supabase + Code |
| Block components | Astro code (site-generator) |
| Design files (CSS) | Supabase Storage |
| Deployed sites | Cloudflare Pages |

---

## 📤 Delivery Payload

**Dashboard** → Next.js on Cloudflare Pages (или Vercel)
**Static Sites** → Cloudflare Pages с custom domains

---

## 📏 Behavioral Rules

### DO:
- Хранить контент в Supabase, не в файлах
- Генерировать Astro проект при деплое
- Использовать Cloudflare API для DNS
- Версионировать шаблоны через slug

### DO NOT:
- Не создавать отдельный git repo для каждого сайта
- Не хранить секреты в коде
- Не деплоить без валидации контента

---

## 🏗️ Architectural Invariants

1. **3-Layer Architecture**: Architecture → Navigation → Tools
2. **Data-First**: Контент в БД, не в файлах
3. **Template-Project Separation**: Шаблон переиспользуется, контент уникален
4. **Atomic Blocks**: Блоки независимы и универсальны
5. **API-Driven Deploy**: Всё через Cloudflare API

---

## 🔧 Maintenance Log

| Дата | Изменение | Причина |
|------|-----------|---------|
| 2026-02-03 | Инициализация | Protocol 0 |
| 2026-02-03 | Data Schema defined | Discovery complete |

---

## 📁 File Structure

```
dl-network/
├── gemini.md                 # 📜 Project Constitution
├── task_plan.md              # 📋 Phases, goals, checklists
├── findings.md               # 🔍 Research, discoveries
├── progress.md               # 📈 What was done
├── apps/
│   ├── dashboard/            # Next.js Dashboard
│   └── site-generator/       # Astro Generator
├── packages/
│   ├── shared/               # Types, utils
│   └── supabase/             # DB client
├── supabase/
│   └── migrations/           # SQL migrations
└── .env
```
