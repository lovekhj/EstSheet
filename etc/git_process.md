# 🐙 GitHub 설정 및 소스 동기화 가이드

이 문서는 **GitHub 웹사이트에서의 저장소 생성 설정부터**, **로컬 소스 코드를 GitHub에 최초 업로드하고 지속적으로 동기화(Pull/Push)**하는 과정을 단계별로 정리한 가이드입니다.

---

## 📌 1. GitHub 웹사이트에서 저장소(Repository) 생성하기

1. **GitHub 로그인**
   - [GitHub 웹사이트(https://github.com)](https://github.com)에 접속하여 로그인합니다.

2. **새 저장소(Repository) 생성 페이지 이동**
   - 상단 우측의 **`+`** 아이콘을 클릭한 뒤 **`New repository`**를 선택합니다. (또는 내 프로필 -> `Repositories` 탭 -> `New` 버튼 클릭)

3. **저장소 설정값 입력**
   - **Repository name**: `EstSheet` (원하는 프로젝트 이름 입력)
   - **Description** (선택): `웹 견적서 작성 및 엑셀 내보내기 프로그램`
   - **Public / Private**: 
     - `Public`: 누구나 코드를 볼 수 있는 공개 저장소
     - `Private`: 나 및 초대된 멤버만 볼 수 있는 비공개 저장소 (원하는 항목 선택)
   - ⚠️ **중요 (Initialize this repository with...)**:
     - **Add a README file**, **Add .gitignore**, **Choose a license** 등 하단의 체크박스들은 **모두 해제(체크 안 함)**합니다. 
     - *(이미 로컬 컴퓨터에 소스 코드와 `README.md`가 작성되어 있으므로 빈 저장소로 생성해야 연결하기 쉽습니다.)*

4. **`Create repository` 버튼 클릭**
   - 생성 후 화면에 표시되는 **저장소 HTTPS URL**을 복사해 둡니다.
   - 예시: `https://github.com/사용자이름/EstSheet.git`

---

## 🚀 2. 로컬(Local) 소스 코드를 GitHub에 최초 등록하기

터미널(Terminal)을 열고 아래 명령어를 순서대로 실행합니다.

### 1단계: 프로젝트 폴더로 이동
```bash
cd /Users/hyunjongkim/Documents/100_prd/EstSheet
```

### 2단계: Git 저장소 초기화
```bash
git init
```
> 로컬 디렉터리를 Git 관리 대상 폴더로 설정합니다.

### 3단계: 전체 파일 스테이징 (Staging)
```bash
git add .
```
> 프로젝트의 모든 소스 파일(`index.html`, `script.js`, `style.css`, `README.md`, `etc/` 등)을 커밋 대기 상태로 만듭니다.

### 4단계: 첫 번째 커밋 생성
```bash
git commit -m "feat: 웹 견적서 프로그램 최초 업로드"
```
> 변경 사항을 설명하는 메시지와 함께 버전 기록을 생성합니다.

### 5단계: 기본 브랜치 이름을 `main`으로 변경
```bash
git branch -M main
```

### 6단계: GitHub 원격 저장소 연결
```bash
git remote add origin https://github.com/사용자이름/EstSheet.git
```
> `https://github.com/사용자이름/EstSheet.git` 부분을 **1단계에서 복사한 본인의 GitHub 저장소 URL**로 변경하여 입력합니다.

### 7단계: GitHub에 소스 코드 최종 푸시 (Push)
```bash
git push -u origin main
```
> `-u` 옵션을 사용하면 이후부터는 `git push` 또는 `git pull`만 입력해도 `origin main`과 자동으로 동기화됩니다.

---

## 🔄 3. 지속적인 소스 코드 수정 및 동기화 방법 (Sync Workflow)

### Case A. 로컬에서 코드를 수정하여 GitHub에 올릴 때 (Local → GitHub)

코드를 수정하거나 새로운 기능을 추가한 후 GitHub에 반영할 때 아래 3 단계를 진행합니다.

1. **상태 확인 (선택)**
   ```bash
   git status
   ```
   *수정되거나 추가된 파일 목록을 확인할 수 있습니다.*

2. **수정 파일 스테이징 및 커밋**
   ```bash
   git add .
   git commit -m "docs: Git 설정 프로세스 문서 추가"
   ```
   *-m 뒤에는 수정 내용을 알기 쉽게 작성합니다.*

3. **GitHub으로 업로드 (Push)**
   ```bash
   git push
   ```

---

### Case B. GitHub(웹)이나 다른 PC에서 수정된 최신 소스를 내 로컬로 가져올 때 (GitHub → Local)

GitHub 웹사이트에서 직접 파일(예: README)을 수정했거나 다른 장소에서 작업한 내용을 가져올 때 실행합니다.

```bash
git pull
```
> 원격 저장소(`origin/main`)의 최신 변경 사항을 다운로드하여 현재 로컬 코드와 자동으로 합쳐줍니다.

## 🌐 4. GitHub Pages (무료 웹호스팅) 설정하기

GitHub Pages는 저장소에 있는 정적 웹사이트 파일(`index.html`, `style.css`, `script.js` 등)을 인터넷에 무료로 배포하고 주소를 생성해 주는 호스팅 서비스입니다.

### 1단계: GitHub 저장소 페이지 접속 및 Settings 이동
- GitHub에 접속하여 `EstSheet` 저장소 페이지로 이동합니다.
- 상단 메뉴 탭 중에서 가장 우측에 있는 **`Settings`** (⚙️ 아이콘)를 클릭합니다.

### 2단계: Pages 메뉴 선택
- 좌측 사이드바 메뉴 항목 중 **`Code and automation`** 섹션 아래에 있는 **`Pages`** 메뉴를 클릭합니다.

### 3단계: 배포 브랜치(Branch) 설정
- **Build and deployment** 항목의 **Source** 옵션이 `Deploy from a branch`로 되어있는지 확인합니다.
- **Branch** 설정:
  - 브랜치 선택: `main` (또는 master)
  - 폴더 선택: `/ (root)`
- **`Save`** 버튼을 클릭합니다.

### 4단계: 배포 완료 및 생성된 웹사이트 URL 확인
- Save 클릭 후 **약 1 ~ 3분** 정도 기다린 후 페이지를 새로고침합니다.
- 상단에 **"Your site is live at https://사용자이름.github.io/EstSheet/"** 라는 메시지와 함께 접속 가능한 무료 웹사이트 주소가 생성됩니다.
- 해당 URL을 클릭하면 웹 브라우저에서 서버 설치 없이 누구나 즉시 견적서 프로그램을 이용할 수 있습니다.

> 💡 **참고 사항**:
> - 이후 로컬에서 코드를 수정하고 `git push`를 하면, GitHub Pages가 자동으로 업데이트(자동 배포)됩니다.
> - 생성된 웹사이트 주소를 `README.md` 상단에 **[Live Demo 링크]**로 추가해 두면 사용자나 방문자가 바로 테스트해 볼 수 있어 좋습니다.

---

## 🔒 5. Private(비공개) 저장소 설정 및 무료 호스팅 대안

소스 코드를 타인에게 공개하지 않고 **Private(비공개)** 저장소로 유지하면서 웹사이트를 무료로 사용하고 싶으실 때 참고하세요.

### 📌 GitHub 정책 참고
- **GitHub Free (무료 계정)**: Private 저장소에서는 GitHub Pages 웹호스팅 기능이 제한됩니다 (GitHub Pro 유료 플랜 필요 또는 Public 전환 필요).
- **해결책**: 소스 코드는 **GitHub Private 저장소**에 올리고, 웹호스팅은 **Vercel** 또는 **Netlify** (100% 무료)를 연결하는 방법입니다!

### 🌟 추천: Private 소스 + Vercel / Netlify 무료 배포 방법
Vercel이나 Netlify는 소스 코드가 Private이라도 **무료로 웹사이트를 호스팅**해 줍니다.

1. **[Vercel](https://vercel.com) 또는 [Netlify](https://www.netlify.com) 회원가입**
   - `Continue with GitHub` 버튼을 눌러 기존 GitHub 계정으로 1초만에 로그인합니다.

2. **`Add New Project` (새 프로젝트 추가)**
   - 내 GitHub의 Private 저장소 `EstSheet`를 선택합니다.

3. **`Deploy` 버튼 클릭**
   - 빌드 설정 수정 없이 `Deploy` 버튼만 누르면 30초 안에 나만의 전용 웹사이트 주소(예: `https://estsheet.vercel.app`)가 즉시 생성됩니다.

> ✨ **장점**:
> - GitHub 소스 코드는 **100% Private(비공개)**로 안전하게 보호됩니다.
> - 웹사이트는 언제 어디서나 접속하여 견적서를 작성할 수 있습니다.
> - `git push` 할 때마다 웹사이트도 자동으로 수정 반영됩니다.


---

## 💡 자주 사용하는 꿀팁 명령어

- **연결된 원격 저장소 URL 확인**:
  ```bash
  git remote -v
  ```
- **최근 커밋 이력 확인**:
  ```bash
  git log --oneline -n 5
  ```
- **원격 저장소 주소를 잘못 입력했을 때 변경**:
  ```bash
  git remote set-url origin https://github.com/사용자이름/새저장소.git
  ```

