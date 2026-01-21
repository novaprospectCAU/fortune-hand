# Mobile Responsive Testing Guide

## Quick Start

```bash
# Start development server
pnpm dev

# Access from mobile device on same network
# Find your local IP: ipconfig (Windows) or ifconfig (Mac/Linux)
# Visit: http://[YOUR_IP]:5173
```

## Chrome DevTools Mobile Testing

1. Open Chrome DevTools (F12)
2. Click Device Toolbar icon (Ctrl/Cmd + Shift + M)
3. Test these presets:

### Essential Viewports

| Device | Width | Height | Notes |
|--------|-------|--------|-------|
| iPhone SE | 375px | 667px | Smallest common iPhone |
| iPhone 12/13/14 | 390px | 844px | Current standard iPhone |
| iPhone 14 Pro Max | 430px | 932px | Largest iPhone |
| Samsung Galaxy S21 | 360px | 800px | Common Android size |
| iPad Mini | 768px | 1024px | Small tablet |

### Custom Sizes to Test
- 320px width (minimum supported)
- 480px width (small phones landscape)
- 640px width (breakpoint boundary)
- 1024px width (tablet landscape)

## What to Test

### 1. Layout & Spacing ✓
- [ ] Header fits without overflow
- [ ] Cards display without cutting off
- [ ] Footer buttons are fully visible
- [ ] Sidebar slides in smoothly
- [ ] No horizontal scrolling (except intentional card hand)

### 2. Touch Targets ✓
- [ ] All buttons are at least 44x44px
- [ ] Buttons don't trigger on accidental taps
- [ ] Cards can be selected easily
- [ ] Sidebar toggle button is easy to hit
- [ ] Joker cards in sidebar are tappable

### 3. Typography ✓
- [ ] All text is readable (minimum 12px)
- [ ] Numbers scale appropriately
- [ ] Phase indicators are clear
- [ ] Score display is legible

### 4. Interactions ✓
- [ ] Card selection works smoothly
- [ ] Slot machine SPIN button responds
- [ ] Roulette wheel can be spun
- [ ] Modal/overlays are dismissible
- [ ] Sidebar opens and closes correctly

### 5. Orientation ✓
- [ ] Portrait mode works (primary)
- [ ] Landscape mode shows hint (height < 500px)
- [ ] Hint is dismissible
- [ ] Layout adapts on rotation

### 6. Safe Areas (iPhone X+) ✓
- [ ] Header doesn't hide behind notch
- [ ] Footer doesn't hide behind home indicator
- [ ] Sidebar respects safe areas
- [ ] Floating button visible above nav bar

### 7. Performance ✓
- [ ] Animations run at 60fps
- [ ] No jank when scrolling
- [ ] Card selection is instant
- [ ] Sidebar animation is smooth

## Testing Checklist by Screen

### Small Phone (375px)
```
✓ Cards overlap appropriately
✓ Hand fits on screen
✓ Buttons stack vertically in footer
✓ Sidebar takes up 85vw max
✓ Slot machine scales down
✓ Roulette wheel fits
```

### Medium Phone (390px)
```
✓ Same as small phone
✓ Slightly more breathing room
✓ Text is more comfortable
```

### Large Phone (430px)
```
✓ Approaching tablet layout
✓ Cards slightly larger
✓ More horizontal space
```

### Tablet Portrait (768px)
```
✓ Buttons start appearing horizontal
✓ Larger touch targets
✓ More spacing overall
✓ Sidebar still slides in
```

### Tablet Landscape (1024px+)
```
✓ Sidebar stays visible
✓ Desktop layout kicks in
✓ Full width utilization
```

## Common Issues & Fixes

### Issue: Horizontal scrolling
**Check:** Card hand container, slot machine, or roulette wheel
**Fix:** Ensure `max-w-*` classes are applied

### Issue: Text too small
**Check:** Responsive text classes (sm:text-*)
**Fix:** Add larger base size or adjust breakpoints

### Issue: Buttons too small to tap
**Check:** Button height in DevTools
**Fix:** Ensure `min-h-[44px]` or larger

### Issue: Notch overlap
**Check:** Header/footer positioning
**Fix:** Use `env(safe-area-inset-*)` in padding

### Issue: Sidebar not closing
**Check:** Overlay click handler
**Fix:** Verify backdrop onClick is wired correctly

## Browser-Specific Testing

### Safari iOS
```
✓ Test on actual device if possible
✓ Check -webkit- prefixes work
✓ Verify safe area insets
✓ Test touch events (not just clicks)
✓ Check for momentum scrolling
```

### Chrome Android
```
✓ Test on actual device if possible
✓ Verify address bar collapse
✓ Check full-screen behavior
✓ Test back button handling
```

## Automated Testing

```bash
# Visual regression testing (if implemented)
pnpm test:visual

# Lighthouse mobile audit
lighthouse http://localhost:5173 --preset=perf --view

# Pa11y accessibility test
pa11y http://localhost:5173
```

## Real Device Testing

### iOS (Recommended)
1. Connect iPhone to same WiFi
2. Get Mac's IP address: `ifconfig | grep "inet "`
3. Visit `http://[IP]:5173` in Safari
4. Enable Web Inspector in Settings > Safari > Advanced
5. Use Safari DevTools on Mac to debug

### Android (Recommended)
1. Enable USB debugging
2. Connect via USB
3. Chrome DevTools > Remote Devices
4. Inspect and test

## Performance Benchmarks

Target metrics on mobile:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Largest Contentful Paint: < 2.5s

## Accessibility on Mobile

- [ ] Screen reader navigation works
- [ ] Tap targets are distinct
- [ ] Color contrast meets WCAG AA
- [ ] Zoom to 200% without breaking layout
- [ ] Focus indicators are visible

## Sign-Off Checklist

Before considering mobile responsive complete:
- [ ] All components render correctly on 320px width
- [ ] Touch targets meet 44x44px minimum
- [ ] Safe areas handled on notched devices
- [ ] Portrait mode is primary, landscape has hint
- [ ] Sidebar interaction is smooth
- [ ] No text is cut off at any breakpoint
- [ ] Performance is acceptable (60fps animations)
- [ ] Real device testing on iOS and Android
- [ ] Accessibility guidelines met

---

Last updated: 2026-01-21
