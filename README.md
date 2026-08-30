# 한솔기록

HTML, CSS, Vanilla JavaScript로 만든 모바일 우선 개인 기록 PWA입니다. 기록과 사진·음성은 서버가 아닌 현재 브라우저의 IndexedDB에 저장됩니다.

## 실행

Service Worker와 마이크 기능 때문에 파일을 직접 더블클릭하지 말고 로컬 서버로 실행하세요.

```bash
python -m http.server 8080
```

브라우저에서 `http://localhost:8080`을 엽니다.

## GitHub Pages 배포

이 폴더의 파일 전체를 저장소 루트에 올린 뒤 GitHub 저장소의 **Settings → Pages → Deploy from a branch**에서 `main` / `(root)`를 선택합니다. 별도 빌드 과정은 없습니다.

## 사용 전 확인

- 휴대폰 브라우저에서 홈 화면 설치, 사진 선택, 마이크 녹음을 한 번씩 시험하세요.
- 브라우저 데이터 삭제 시 기록도 삭제됩니다. 정기적으로 **내보내기 → 전체 백업 파일 저장**을 사용하세요.
- PDF는 브라우저 인쇄 화면에서 **PDF로 저장**을 선택하는 방식입니다.
- 백업 복원은 기존 기록을 유지하면서 같은 날짜의 기록을 백업 내용으로 갱신합니다.

## 구조

- `db.js`: IndexedDB 기록/Blob 저장
- `audio.js`: 브라우저 음성 녹음
- `pdf.js`: 기간별 인쇄용 보고서
- `backup.js`: JSON 백업/복원
- `service-worker.js`: 오프라인 캐시
