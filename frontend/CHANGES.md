# Trailhead frontend changes

## Learning Trail reliability fix
- Learning Trail retries roadmap creation when an assessment exists but the roadmap is missing.
- Weekly quiz submission uses the roadmap returned by the assessment endpoint and only calls the legacy refresh endpoint as a fallback.
- The UI no longer treats a missing roadmap as proof that the student has never taken a quiz; it can distinguish a saved assessment from a missing trail.
