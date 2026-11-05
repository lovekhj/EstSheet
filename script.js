// script.js는 프로그램의 "두뇌" 역할을 합니다.
// 계산을 하고, 새로운 줄을 만들고, 체크박스를 감시합니다.

// --- 설정값들 ---
const MAX_ROWS = 27; // 최대 27개 행으로 고정
const UNIT_OPTIONS = ['개', 'm', '대', '중', '소', 'kg']; // 단위 콤보 박스 목록

// --- 페이지가 다 로드되면(준비되면) 실행되는 함수 ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTable(); // 테이블 초기화 (27개 줄 만들기)
    setupEventListeners(); // 이벤트 감시 시작 (체크박스 클릭 등)
    updateDate(); // 오늘 날짜 자동으로 넣기
});

// 1. 테이블 초기화 함수
function initializeTable() {
    const tbody = document.getElementById('table-body');

    // 27개 행 고정 생성
    for (let i = 0; i < MAX_ROWS; i++) {
        addRow(i + 1); // 1, 2, 3 ... 27까지 번호를 매겨서 추가
    }
}

// 2. 오늘 날짜 넣는 함수
function updateDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 0부터 시작하므로 +1
    const day = today.getDate();

    document.getElementById('date-year').value = year;
    document.getElementById('date-month').value = month;
    document.getElementById('date-day').value = day;
}

// 3. 줄(Row) 추가하는 함수
function addRow(rowNumber) {
    const tbody = document.getElementById('table-body');
    const tr = document.createElement('tr'); // 새로운 줄(tr) 생성
    // 처음에는 빈칸으로 두고, 목록에는 단위 6개만 보이도록 빈 항목은 숨깁니다.
    const unitOptions = UNIT_OPTIONS.map(unit => `<option value="${unit}">${unit}</option>`).join('');

    // 각 칸(td) 안에 입력창(input)을 넣어서 만듭니다.
    tr.innerHTML = `
        <td>${rowNumber}</td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><input type="number" class="qty" oninput="calculate(this)"></td>
        <td><select class="unit"><option value="" selected disabled hidden></option>${unitOptions}</select></td>
        <td><input type="text" class="price" oninput="formatAndCalculate(this)"></td>
        <td><input type="text" class="amount" oninput="updateTotals()"></td>
        <td><input type="text" class="tax" readonly></td>
        <td><input type="text" class="note"></td>
    `;

    tbody.appendChild(tr); // 테이블 몸통에 붙이기
}

// 4. 입력값 포맷팅 및 계산 함수 (단가 입력 시 호출)
function formatAndCalculate(inputElement) {
    let value = inputElement.value.replace(/[^0-9]/g, ''); // 숫자만 남기기
    if (value) {
        inputElement.value = parseInt(value, 10).toLocaleString(); // 콤마 찍기
    }

    calculate(inputElement); // 계산 로직 호출
}

// 5. 계산 함수 (수량이나 단가가 바뀌면 실행됨)
function calculate(inputElement) {
    const tr = inputElement.closest('tr'); // 현재 작업 중인 줄을 찾습니다.

    // 입력된 값 가져오기 (콤마 제거 후 숫자 변환)
    const qty = parseFloat(tr.querySelector('.qty').value) || 0;
    const priceStr = tr.querySelector('.price').value.replace(/,/g, ''); // 콤마 제거
    const price = parseFloat(priceStr) || 0;

    // 공급가액 계산 (수량 x 단가)
    const amount = qty * price;
    tr.querySelector('.amount').value = amount.toLocaleString(); // 콤마 찍어서 보여주기

    updateTotals(); // 전체 합계 다시 계산하기
}

// 6. 전체 합계 업데이트 함수
function updateTotals() {
    const isVatIncluded = document.getElementById('vat-check').checked; // 체크박스 상태 확인
    const rows = document.querySelectorAll('#table-body tr');

    let totalSupply = 0; // 총 공급가액
    let totalTax = 0;    // 총 세액

    rows.forEach(tr => {
        // 콤마가 들어간 문자열을 숫자로 다시 변환 (예: "10,000" -> 10000)
        const amountStr = tr.querySelector('.amount').value.replace(/,/g, '');
        const amount = parseFloat(amountStr) || 0;

        // 부가세 계산 로직
        let tax = 0;
        if (isVatIncluded) {
            tax = Math.floor(amount * 0.1); // 10% 계산 후 소수점 버림
        }

        // 화면에 세액 표시 (0원이면 빈 칸으로 표시)
        if (tax === 0) {
            tr.querySelector('.tax').value = "";
        } else {
            tr.querySelector('.tax').value = tax.toLocaleString();
        }

        totalSupply += amount;
        totalTax += tax;
    });

    const grandTotal = totalSupply + totalTax;

    // 하단 합계 줄 업데이트
    document.getElementById('footer-supply-total').innerText = totalSupply.toLocaleString();
    document.getElementById('footer-tax-total').innerText = totalTax.toLocaleString();

    // 상단 헤더 합계 업데이트
    document.getElementById('header-total-number').innerText = grandTotal.toLocaleString();
    document.getElementById('header-total-korean').innerText = numberToKorean(grandTotal);
}

// 7. 이벤트를 연결하는 함수 (수정됨)
function setupEventListeners() {
    // 부가세 체크박스 변경 시 계산
    document.getElementById('vat-check').addEventListener('change', updateTotals);

    // 테이블 내 키보드 방향키 이동 로직 추가
    const tbody = document.getElementById('table-body');
    tbody.addEventListener('keydown', handleKeyDown);
}

// [추가] 방향키 이동 처리 함수
function handleKeyDown(e) {
    const active = document.activeElement;
    if (active.tagName !== 'INPUT' && active.tagName !== 'SELECT') return;

    const td = active.parentElement;
    const tr = td.parentElement;

    // td들만 모아서 정확한 인덱스 계산
    const cells = Array.from(tr.querySelectorAll('td'));
    const colIndex = cells.indexOf(td);
    const rowIndex = Array.from(tr.parentElement.children).indexOf(tr);

    // 콤보 박스: 위/아래/Enter는 값 선택에 쓰고, 좌우 방향키만 칸 이동에 사용
    if (active.tagName === 'SELECT') {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault(); // 좌우 방향키로 값이 바뀌는 것 방지
            moveFocus(rowIndex, colIndex + (e.key === 'ArrowLeft' ? -1 : 1));
        }
        return;
    }

    // 수량(number) 입력창 숫자 증감 방지
    if (active.type === 'number' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
    }

    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault(); // 브라우저 스크롤 방지
            moveFocus(rowIndex - 1, colIndex);
            break;
        case 'ArrowDown':
            e.preventDefault();
            moveFocus(rowIndex + 1, colIndex);
            break;
        case 'ArrowLeft':
            // 글자 맨 앞일 때 이동하거나, 그냥 즉시 이동하고 싶다면 아래처럼 사용
            moveFocus(rowIndex, colIndex - 1);
            break;
        case 'ArrowRight':
            // 다음 칸으로 이동
            moveFocus(rowIndex, colIndex + 1);
            break;
        case 'Enter':
            e.preventDefault();
            moveFocus(rowIndex + 1, colIndex);
            break;
    }
}

function moveFocus(rowIdx, colIdx) {
    const rows = document.querySelectorAll('#table-body tr');

    // 행 범위를 벗어나지 않게 체크
    if (rowIdx < 0 || rowIdx >= rows.length) return;

    const targetRow = rows[rowIdx];
    const targetCells = targetRow.querySelectorAll('td');

    // 열 범위를 벗어나지 않게 체크
    if (colIdx < 0 || colIdx >= targetCells.length) return;

    const targetCell = targetCells[colIdx];
    const targetInput = targetCell.querySelector('input, select');

    if (targetInput) {
        // 읽기 전용(세액 등)인 경우 옆으로 한 칸 더 이동
        if (targetInput.readOnly) {
            // 오른쪽으로 가던 중이면 한 칸 더 오른쪽으로, 왼쪽이면 왼쪽으로
            // 여기서는 단순하게 다음 칸(오른쪽)으로 토스합니다.
            moveFocus(rowIdx, colIdx + 1);
        } else {
            targetInput.focus();
            // 포커스 시 텍스트 전체 선택 (선택 사항: 수정하기 편함)
            // targetInput.select(); 
        }
    }
}
// 8. 숫자를 한글로 바꿔주는 마법의 함수 (예: 10000 -> 일만)
function numberToKorean(number) {
    if (number === 0) return ""; // 0원이면 "영" 표시 안함

    const units = ["", "만", "억", "조"];
    const nums = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
    let result = "";
    let unitIndex = 0;

    // 10000으로 나누면서 처리 (만, 억, 조 단위로 끊기)
    while (number > 0) {
        const chunk = number % 10000;

        if (chunk > 0) {
            let chunkStr = "";
            let temp = chunk;

            // 천, 백, 십, 일 자리 처리
            if (Math.floor(temp / 1000) > 0) { chunkStr += nums[Math.floor(temp / 1000)] + "천"; }
            temp %= 1000;
            if (Math.floor(temp / 100) > 0) { chunkStr += nums[Math.floor(temp / 100)] + "백"; }
            temp %= 100;
            if (Math.floor(temp / 10) > 0) { chunkStr += nums[Math.floor(temp / 10)] + "십"; }
            temp %= 10;
            if (temp > 0) { chunkStr += nums[temp]; }

            result = chunkStr + units[unitIndex] + " " + result;
        }

        number = Math.floor(number / 10000);
        unitIndex++;
    }

    return result.trim();
}

// 9. 초기화 함수
function resetPage() {
    if (confirm("작성한 내용이 모두 사라집니다. 초기화 하시겠습니까?")) {
        location.reload(); // 페이지 새로고침으로 초기화
    }
}

// 10. 엑셀 다운로드 함수 (27개 행 고정, 행 추가 로직 제거)
async function downloadExcel() {
    try {
        console.log("엑셀 다운로드 시작...");

        // 1. 템플릿 파일 가져오기
        // const response = await fetch('sample/견적서양식_sample.xlsx');
        // if (!response.ok) {
        //     throw new Error(`템플릿 파일을 불러오는데 실패했습니다. (Status: ${response.status})`);
        // }
        // const arrayBuffer = await response.arrayBuffer();

        // 1. fetch 대신 변수에 저장된 Base64 데이터를 사용
        // 사용자는 live server를 쓰지 않기 때문에. 이렇게 처리 함.
        const base64Data = "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";

        // Base64를 ArrayBuffer로 변환하는 과정
        const binaryString = window.atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;


        // 2. ExcelJS로 워크북 로드
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.getWorksheet(1); // 첫 번째 시트 가져오기

        // 3. 데이터 매핑

        // [일자]
        // 년도: B5, 월: F5, 일: I5
        const year = document.getElementById('date-year').value;
        const month = document.getElementById('date-month').value;
        const day = document.getElementById('date-day').value;

        worksheet.getCell('B5').value = parseInt(year) || year;
        worksheet.getCell('F5').value = parseInt(month) || month;
        worksheet.getCell('I5').value = parseInt(day) || day;

        // [수신자]
        // 수신자 입력부분: B7
        const recipient = document.getElementById('recipient-name')?.value.trim() || "";
        worksheet.getCell('B7').value = recipient;

        // [합계금액]
        // 한글 합계: L11, 숫자 합계: AH11
        const totalKorean = document.getElementById('header-total-korean').innerText;
        const totalNumberStr = document.getElementById('header-total-number').innerText.replace(/,/g, '');

        worksheet.getCell('L11').value = totalKorean;
        worksheet.getCell('AH11').value = parseInt(totalNumberStr) || 0;

        // [품목 리스트] - 27개 행 고정
        // 시작 행: 14행, 끝 행: 40행 (14 + 27 - 1 = 40)
        // 품명: A, 규격: K, 수량: O, 단위: R, 단가: T, 공급가액: X, 세액: AH
        const rows = document.querySelectorAll('#table-body tr');
        const startRow = 14;

        console.log(`총 ${rows.length}개 행 처리 (최대 27개)`);

        rows.forEach((tr, idx) => {
            const currentRowIndex = startRow + idx; // 14, 15, 16, ..., 40
            const inputs = tr.querySelectorAll('input');

            // inputs 순서: 0:품명, 1:규격, 2:수량, 3:단가, 4:공급가액, 5:세액, 6:비고
            const subject = inputs[0]?.value.trim() || "";
            const spec = inputs[1]?.value.trim() || "";
            const qty = parseFloat(inputs[2]?.value) || 0;
            const price = parseFloat(inputs[3]?.value.replace(/,/g, '')) || 0;
            const amount = parseFloat(inputs[4]?.value.replace(/,/g, '')) || 0;
            const tax = parseFloat(inputs[5]?.value.replace(/,/g, '')) || 0;
            const note = inputs[6]?.value.trim() || "";
            const unit = tr.querySelector('.unit')?.value || ""; // 단위는 input이 아닌 select라서 별도로 읽음

            // 데이터 입력 및 정렬 (품명/비고 왼쪽 정렬)
            const subjectCell = worksheet.getCell(`A${currentRowIndex}`);
            subjectCell.value = subject;
            subjectCell.alignment = { horizontal: 'left', vertical: 'middle' };

            worksheet.getCell(`K${currentRowIndex}`).value = spec;

            if (qty > 0) worksheet.getCell(`O${currentRowIndex}`).value = qty;
            if (unit) worksheet.getCell(`R${currentRowIndex}`).value = unit;
            if (price > 0) worksheet.getCell(`T${currentRowIndex}`).value = price;
            if (amount > 0) worksheet.getCell(`X${currentRowIndex}`).value = amount;
            if (tax > 0) worksheet.getCell(`AH${currentRowIndex}`).value = tax;

            if (note) {
                const noteCell = worksheet.getCell(`AL${currentRowIndex}`);
                noteCell.value = note;
                noteCell.alignment = { horizontal: 'left', vertical: 'middle' };
            }
        });

        // [하단 합계] - 27개 행 기준: 41행
        const footerRowIndex = 41;

        const supplyTotal = parseInt(document.getElementById('footer-supply-total').innerText.replace(/,/g, '')) || 0;
        const taxTotal = parseInt(document.getElementById('footer-tax-total').innerText.replace(/,/g, '')) || 0;

        worksheet.getCell(`X${footerRowIndex}`).value = supplyTotal;
        worksheet.getCell(`AH${footerRowIndex}`).value = taxTotal;

        // [하단 특기사항 영역] 42~44행
        const noteLine1 = document.getElementById('note-line1')?.value.trim() || "";
        const noteLine2 = document.getElementById('note-line2')?.value.trim() || "";
        const noteLine3 = document.getElementById('note-line3')?.value.trim() || "";
        if (noteLine1) worksheet.getCell('A42').value = noteLine1;
        if (noteLine2) worksheet.getCell('A43').value = noteLine2;
        if (noteLine3) worksheet.getCell('A44').value = noteLine3;

        // 엑셀 전용 열 너비 세부 조절
        // 1) 단위 (R~S: 2개 열), 단가 (T~W: 4개 열) -> 단가는 기존 폭(13.8) 유지
        ['R', 'S'].forEach(col => {
            worksheet.getColumn(col).width = 2.3;
        });
        ['T', 'U', 'V', 'W'].forEach(col => {
            worksheet.getColumn(col).width = 3.45;
        });

        // 2) 공급가액 (X~AF: 1.4), AG 열은 '성명', '종목' 글자 잘림 방지를 위해 2.8로 약간 확대
        ['X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF'].forEach(col => {
            worksheet.getColumn(col).width = 1.4;
        });
        worksheet.getColumn('AG').width = 2.8;

        // 3) 세액 (AH~AK: 4개 열) -> 윈도우 보기 최적화를 위해 약간 확대 (2.8)
        ['AH', 'AI', 'AJ', 'AK'].forEach(col => {
            worksheet.getColumn(col).width = 2.8;
        });

        // 4) 비고 (AL~AP: 5개 열) -> 규격 확대분만큼 축소 (2.7)
        ['AL', 'AM', 'AN', 'AO', 'AP'].forEach(col => {
            worksheet.getColumn(col).width = 2.7;
        });

        // 5) 규격 (K~N: 4개 열) -> 비고에서 줄인 만큼 확대 (2.8)
        ['K', 'L', 'M', 'N'].forEach(col => {
            worksheet.getColumn(col).width = 2.8;
        });

        // [인쇄 설정 - A4 1장 고정 출력]
        worksheet.pageSetup = {
            ...worksheet.pageSetup,
            paperSize: 9,
            orientation: 'portrait',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 1,
            margins: {
                left: 0.25,
                right: 0.25,
                top: 0.4,
                bottom: 0.4,
                header: 0.2,
                footer: 0.2
            },
            horizontalCentered: true,
            verticalCentered: false
        };

        console.log('합계 및 하단 영역 입력 완료');

        // 4. 파일 생성 및 다운로드
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // 파일명 생성: 수신자_yyyymmdd.xlsx
        const d = new Date();
        const dateString = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
        const safeRecipient = recipient || "견적서";
        const fileName = `${safeRecipient}_${dateString}.xlsx`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        console.log('다운로드 완료:', fileName);
        alert('엑셀 다운로드가 완료되었습니다!');

    } catch (e) {
        console.error("엑셀 다운로드 오류:", e);
        alert("엑셀 다운로드 중 오류가 발생했습니다.\n\n" + e.message);
    }
}