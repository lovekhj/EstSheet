# 🔐 GitHub Pro (유료)를 이용한 Private 저장소 호스팅 가이드

이 문서는 **GitHub Pro (유료 플랜)**를 구독하여 **소스 코드는 100% Private(비공개)**로 안전하게 유지하면서, **GitHub Pages 무료 웹호스팅 기능**을 함께 사용하는 방법과 설정 절차를 정리한 가이드입니다.

---

## 💰 1. GitHub Pro 요금제 개요

- **비용**: 월 **$4** (또는 연간 결제 시 할인)
- **핵심 혜택**:
  - **Private 저장소에서 GitHub Pages 웹호스팅 사용 가능** (무료 계정에서는 Public 저장소만 호스팅 가능)
  - 더 많은 GitHub Actions 가동 시간 (월 3,000분 제공)
  - 3GB 이상의 웹 배포/패키지 스토리지 제공
  - 고급 코드 리뷰 도구 및 이슈 관리 기능 제공

---

## 💳 2. GitHub 계정을 Pro로 업그레이드하는 방법

1. **GitHub 로그인 후 설정 이동**
   - 우측 상단 프로필 이미지 클릭 ➔ **`Settings`** 클릭

2. **결제 및 플랜 메뉴 이동**
   - 좌측 사이드바 ➔ **`Billing and plans`** ➔ **`Plans and usage`** 선택

3. **플랜 변경**
   - `Current plan` 항목 옆의 **`Upgrade to Pro`** 버튼 클릭
   - 결제 주기 (Monthly $4 / Yearly) 및 신용카드/PayPal 결제 정보 입력 후 결제 완료

---

## 🔒 3. Private 저장소 설정 및 GitHub Pages 배포 절차

### 1단계: 저장소를 Private(비공개)으로 설정
- **기존 저장소를 Private으로 변경할 때**:
  - 저장소 ➔ **`Settings`** ➔ 맨 아래 **`Danger Zone`** 섹션 이동
  - **`Change repository visibility`** 클릭 ➔ `Change to private` 선택 후 저장소 이름 입력하여 확정
- **새 저장소 생성 시**:
  - 저장소 생성 페이지에서 **`Private`** 라디오 버튼 선택

### 2단계: GitHub Pages 기능 활성화
1. 저장소 상단 메뉴의 **`Settings`** (⚙️) 탭 클릭
2. 좌측 사이드바의 **`Pages`** 메뉴 선택
3. **Build and deployment** 섹션의 **Source**: `Deploy from a branch` 선택
4. **Branch**: `main` (또는 master) / **Folder**: `/ (root)` 선택 후 **`Save`** 클릭

### 3단계: 배포 완료 주소 확인
- Save 후 1~3분 뒤 페이지를 새로고침하면 상단에 웹사이트 주소가 출력됩니다.
- 주소 예시: `https://사용자이름.github.io/EstSheet/`

---

## 🛡️ 4. Private 호스팅 시 보안 및 접근성 특징

- **소스 코드 보안 (Complete Privacy)**:
  - `https://github.com/사용자이름/EstSheet` 저장소 주소는 오직 본인(및 초대된 멤버)만 접근할 수 있습니다. 
  - 타인이 해당 주소에 접근 시 `404 Not Found`가 발생하며 소스 코드나 커밋 기록이 절대 노출되지 않습니다.

- **웹사이트 접속**:
  - 배포된 웹사이트 주소(`https://사용자이름.github.io/EstSheet/`)를 통해서는 완성된 웹 견적서 브라우저 화면이 작동합니다.

---

## 🔄 5. 플랜 다운그레이드 / 취소 방법

만약 더 이상 유료 플랜이 필요 없을 경우 언제든지 무료(Free) 플랜으로 다운그레이드할 수 있습니다:
1. **`Settings`** ➔ **`Billing and plans`** ➔ **`Plans and usage`** 이동
2. `Edit` ➔ **`Downgrade to Free`** 선택 (기존 결제 주기가 끝날 때까지 Pro 기능 유지)
