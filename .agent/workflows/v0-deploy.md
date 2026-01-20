---
description: v0.app 배포 환경에서 개발할 때 주의사항
---

# v0.app 배포 가이드

## 중요 규칙

1. **빌드 폴더 제외**: `.next`, `dist`, `build` 폴더는 절대 Git에 커밋하지 않음
2. **node_modules 제외**: 항상 `.gitignore`에 포함되어야 함
3. **정기적 푸시**: 변경사항이 쌓이면 v0에서 Pull 실패 가능 → 작업 단위별로 커밋/푸시
4. **파일 크기**: 단일 커밋에 너무 많은 변경 피하기 (v0 Pull 한계: ~수십 MB)

## .gitignore 필수 항목

```
node_modules
.next
dist
build
.vercel
.env*.local
*.log
.DS_Store
```

## 개발 시 권장 사항

- 큰 기능은 여러 개의 작은 커밋으로 나누기
- 파일당 1000줄 이내 유지 (v0 처리 최적화)
- 미디어 파일은 CDN/외부 저장소 사용

## 배포 워크플로우

1. 로컬에서 코드 수정
2. `git add . && git commit -m "메시지"`
3. GitHub Desktop 또는 `git push`
4. v0.app에서 Pull Changes 또는 자동 배포
