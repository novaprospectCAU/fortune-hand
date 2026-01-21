# Fortune's Hand - 배포 가이드

## Vercel 배포 (권장)

### 자동 배포

1. **GitHub 연결**
   - [Vercel](https://vercel.com)에 로그인
   - "New Project" 클릭
   - GitHub 저장소 연결: `fortune-hand`
   - 프레임워크 자동 감지됨 (Vite)

2. **환경 설정** (자동)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **배포**
   - "Deploy" 클릭
   - 자동으로 `main` 브랜치 푸시 시 배포

### 수동 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포 (프로젝트 루트에서)
vercel

# 프로덕션 배포
vercel --prod
```

## Netlify 배포

### 자동 배포

1. [Netlify](https://netlify.com)에 로그인
2. "New site from Git" 클릭
3. GitHub 저장소 연결
4. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `dist`

### netlify.toml (선택)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## GitHub Pages 배포

### 설정

1. `vite.config.ts` 수정:
```typescript
export default defineConfig({
  base: '/fortune-hand/', // 저장소 이름
  // ...
})
```

2. GitHub Actions 워크플로우 (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

3. GitHub 저장소 설정:
   - Settings → Pages → Source: `gh-pages` branch

## 환경 변수

현재 환경 변수 필요 없음.

추후 필요 시:
```bash
# Vercel
vercel env add VITE_API_URL

# .env.production
VITE_API_URL=https://api.example.com
```

## 빌드 최적화

### 현재 빌드 크기
```
dist/index.html         1.23 kB │ gzip:   0.59 kB
dist/assets/index.css  43.37 kB │ gzip:   7.78 kB
dist/assets/index.js  343.73 kB │ gzip: 107.66 kB
```

### 추가 최적화 (선택)

1. **코드 스플리팅**
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        motion: ['framer-motion'],
        state: ['zustand'],
      }
    }
  }
}
```

2. **이미지 최적화**
- WebP 형식 사용
- 적절한 크기 제공

## 배포 체크리스트

- [ ] 모든 테스트 통과 (`npm test`)
- [ ] 타입 체크 통과 (`npm run typecheck`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 로컬 프리뷰 확인 (`npm run preview`)
- [ ] 환경 변수 설정 (필요 시)
- [ ] 도메인 설정 (선택)
- [ ] SSL 인증서 확인 (자동)

## 도메인 설정 (선택)

### Vercel
1. Project Settings → Domains
2. 커스텀 도메인 추가
3. DNS 설정 (CNAME → cname.vercel-dns.com)

### Netlify
1. Site Settings → Domain management
2. 커스텀 도메인 추가
3. DNS 설정 안내 따르기

## 모니터링

### Vercel Analytics (무료)
```bash
npm i @vercel/analytics
```

```tsx
// main.tsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### Web Vitals
빌드 시 자동으로 측정됨.

## 롤백

### Vercel
- Dashboard → Deployments → 이전 배포 선택 → "Promote to Production"

### Netlify
- Deploys → 이전 배포 선택 → "Publish deploy"

## 문제 해결

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build

# 캐시 클리어
rm -rf node_modules dist
npm install
npm run build
```

### 404 에러
- SPA 라우팅을 위한 rewrite 규칙 확인
- vercel.json 또는 netlify.toml 설정 확인

### 환경 변수 미적용
- `VITE_` 접두사 필수
- 배포 플랫폼에서 환경 변수 설정 확인
- 재배포 필요
