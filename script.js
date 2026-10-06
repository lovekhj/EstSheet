// script.js는 프로그램의 "두뇌" 역할을 합니다.
// 계산을 하고, 새로운 줄을 만들고, 체크박스를 감시합니다.

// --- 설정값들 ---
const MAX_ROWS = 24; // 최대 24개 행으로 고정

// --- 페이지가 다 로드되면(준비되면) 실행되는 함수 ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTable(); // 테이블 초기화 (24개 줄 만들기)
    setupEventListeners(); // 이벤트 감시 시작 (체크박스 클릭 등)
    updateDate(); // 오늘 날짜 자동으로 넣기
});

// 1. 테이블 초기화 함수
function initializeTable() {
    const tbody = document.getElementById('table-body');

    // 24개 행 고정 생성
    for (let i = 0; i < MAX_ROWS; i++) {
        addRow(i + 1); // 1, 2, 3 ... 24까지 번호를 매겨서 추가
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

    // 각 칸(td) 안에 입력창(input)을 넣어서 만듭니다.
    tr.innerHTML = `
        <td>${rowNumber}</td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><input type="number" class="qty" oninput="calculate(this)"></td>
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
    if (active.tagName !== 'INPUT') return;

    const td = active.parentElement;
    const tr = td.parentElement;

    // td들만 모아서 정확한 인덱스 계산
    const cells = Array.from(tr.querySelectorAll('td'));
    const colIndex = cells.indexOf(td);
    const rowIndex = Array.from(tr.parentElement.children).indexOf(tr);

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
    const targetInput = targetCell.querySelector('input');

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

// 10. 엑셀 다운로드 함수 (24개 행 고정, 행 추가 로직 제거)
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

        // [품목 리스트] - 24개 행 고정
        // 시작 행: 14행, 끝 행: 36행 (13 + 24 - 1 = 37)
        // 품명: A, 규격: K, 수량: O, 단가: R, 공급가액: X, 세액: AH
        const rows = document.querySelectorAll('#table-body tr');
        const startRow = 14;

        console.log(`총 ${rows.length}개 행 처리 (최대 24개)`);

        rows.forEach((tr, idx) => {
            const currentRowIndex = startRow + idx; // 13, 14, 15, ..., 36
            const inputs = tr.querySelectorAll('input');

            // inputs 순서: 0:품명, 1:규격, 2:수량, 3:단가, 4:공급가액, 5:세액, 6:비고
            const subject = inputs[0]?.value.trim() || "";
            const spec = inputs[1]?.value.trim() || "";
            const qty = parseFloat(inputs[2]?.value) || 0;
            const price = parseFloat(inputs[3]?.value.replace(/,/g, '')) || 0;
            const amount = parseFloat(inputs[4]?.value.replace(/,/g, '')) || 0;
            const tax = parseFloat(inputs[5]?.value.replace(/,/g, '')) || 0;
            const note = inputs[6]?.value.trim() || "";

            // 데이터 입력 및 정렬 (품명/비고 왼쪽 정렬)
            const subjectCell = worksheet.getCell(`A${currentRowIndex}`);
            subjectCell.value = subject;
            subjectCell.alignment = { horizontal: 'left', vertical: 'middle' };

            worksheet.getCell(`K${currentRowIndex}`).value = spec;

            if (qty > 0) worksheet.getCell(`O${currentRowIndex}`).value = qty;
            if (price > 0) worksheet.getCell(`R${currentRowIndex}`).value = price;
            if (amount > 0) worksheet.getCell(`X${currentRowIndex}`).value = amount;
            if (tax > 0) worksheet.getCell(`AH${currentRowIndex}`).value = tax;

            if (note) {
                const noteCell = worksheet.getCell(`AL${currentRowIndex}`);
                noteCell.value = note;
                noteCell.alignment = { horizontal: 'left', vertical: 'middle' };
            }
        });

        // [하단 합계] - 24개 행 기준: 38행
        const footerRowIndex = 38;

        const supplyTotal = parseInt(document.getElementById('footer-supply-total').innerText.replace(/,/g, '')) || 0;
        const taxTotal = parseInt(document.getElementById('footer-tax-total').innerText.replace(/,/g, '')) || 0;

        worksheet.getCell(`X${footerRowIndex}`).value = supplyTotal;
        worksheet.getCell(`AH${footerRowIndex}`).value = taxTotal;

        // [하단 특기사항 영역] 39~41행
        const noteLine1 = document.getElementById('note-line1')?.value.trim() || "";
        const noteLine2 = document.getElementById('note-line2')?.value.trim() || "";
        const noteLine3 = document.getElementById('note-line3')?.value.trim() || "";
        if (noteLine1) worksheet.getCell('A39').value = noteLine1;
        if (noteLine2) worksheet.getCell('A40').value = noteLine2;
        if (noteLine3) worksheet.getCell('A41').value = noteLine3;

        // 엑셀 전용 열 너비 세부 조절
        // 1) 단가 (R~W: 6개 열) -> 조금 더 늘림 (2.3)
        ['R', 'S', 'T', 'U', 'V', 'W'].forEach(col => {
            worksheet.getColumn(col).width = 2.3;
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

        // 4) 비고 (AL~AP: 5개 열) -> 세액이 늘어난 만큼 약간 축소 (3.5)
        ['AL', 'AM', 'AN', 'AO', 'AP'].forEach(col => {
            worksheet.getColumn(col).width = 3.5;
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