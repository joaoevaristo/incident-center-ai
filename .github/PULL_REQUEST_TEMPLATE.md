## 📋 Objective

<!-- Brief description of what this PR achieves -->

**What:**
<!-- What is being changed? -->

**Why:**
<!-- Why is this change needed? Business/technical value -->

---

## 📖 Context

<!-- Background information, related issues, previous discussions -->

**Related Issues:**
- Closes #<!-- issue number -->

**Architecture Decision:**
<!-- Link to ADR if this involves architectural decisions -->
- ADR-XXX: <!-- title -->

---

## 🏗️ Architecture Impact

<!-- Does this PR affect the architecture? Be honest. -->

- [ ] **No impact** - Localized change within existing patterns
- [ ] **Minor impact** - Follows existing patterns, extends functionality
- [ ] **Moderate impact** - New component/service, requires integration review
- [ ] **Significant impact** - New architecture decision, requires architect review

**Details:**
<!-- Describe architectural impact in detail -->

---

## 🎯 Acceptance Criteria

<!-- What must be true for this PR to be considered complete? -->

- [ ] Code follows project conventions (lint, typecheck pass)
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if applicable)
- [ ] No secrets/credentials exposed
- [ ] Change log updated (if breaking change)
- [ ] Performance considerations addressed
- [ ] Security considerations addressed

---

## 📸 Screenshots / GIFs

<!-- For UI changes, include before/after screenshots or GIFs -->

| Before | After |
|--------|-------|
| <!-- screenshot --> | <!-- screenshot --> |

---

## ⚠️ Risks & Mitigations

<!-- What could go wrong? How will you mitigate? -->

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| <!-- risk description --> | High/Med/Low | High/Med/Low | <!-- mitigation --> |

---

## 📝 Changes Summary

### Files Changed

| File | Type | Description |
|------|------|-------------|
| `<!-- path -->` | <!-- feat/fix/refactor --> | <!-- brief description --> |

### API Changes

<!-- If API endpoints changed, document here -->

**New Endpoints:**
```
<!-- METHOD /path -->
<!-- Request/Response schema -->
```

**Modified Endpoints:**
```
<!-- METHOD /path -->
<!-- What changed -->
```

**Deprecated Endpoints:**
```
<!-- METHOD /path -->
<!-- Deprecation reason -->
```

### Database Changes

<!-- If schema changed, document migrations -->

**New Tables:**
- `<!-- table_name -->`: <!-- description -->

**Modified Tables:**
- `<!-- table_name -->`: <!-- what changed -->

**Migrations:**
- `<!-- migration_name -->`: <!-- description -->

---

## ✅ Checklist

### Code Quality
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] No debug code or console.logs in production
- [ ] Error handling implemented
- [ ] Input validation added

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added (if applicable)
- [ ] Manual testing completed
- [ ] Edge cases considered

### Documentation
- [ ] README updated (if applicable)
- [ ] API documentation updated
- [ ] Code comments added for complex logic
- [ ] ADR created (if architectural decision)

### Security
- [ ] No secrets/keys exposed
- [ ] Input validation on all user inputs
- [ ] Authentication/Authorization checked
- [ ] CORS configured appropriately

### Performance
- [ ] No N+1 queries
- [ ] Pagination implemented for lists
- [ ] Caching strategy considered
- [ ] Bundle size impact assessed

---

## 🔄 Review Notes

<!-- For reviewer to document review feedback -->

**Reviewer:** <!-- name -->
**Date:** <!-- date -->

**Feedback:**
<!-- Review comments and responses -->

- [ ] <!-- comment --> → <!-- response -->
- [ ] <!-- comment --> → <!-- response -->

**Approval:** [ ] Approved [ ] Changes Requested [ ] Needs More Info

---

## 🚀 Deployment Notes

<!-- Any special deployment considerations? -->

- [ ] Database migrations required
- [ ] Environment variables needed
- [ ] Feature flag required
- [ ] Rollback plan documented
- [ ] Monitoring/alerts updated
