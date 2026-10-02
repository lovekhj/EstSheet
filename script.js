// script.js는 프로그램의 "두뇌" 역할을 합니다.
// 계산을 하고, 새로운 줄을 만들고, 체크박스를 감시합니다.

// --- 설정값들 ---
const MAX_ROWS = 18; // 최대 18개 행으로 고정

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

        // [하단 합계] - 18개 행 기준: 32행
        const footerRowIndex = 32;

        const supplyTotal = parseInt(document.getElementById('footer-supply-total').innerText.replace(/,/g, '')) || 0;
        const taxTotal = parseInt(document.getElementById('footer-tax-total').innerText.replace(/,/g, '')) || 0;

        worksheet.getCell(`X${footerRowIndex}`).value = supplyTotal;
        worksheet.getCell(`AH${footerRowIndex}`).value = taxTotal;

        // [하단 특기사항 영역] 33~35행
        const noteLine1 = document.getElementById('note-line1')?.value.trim() || "";
        const noteLine2 = document.getElementById('note-line2')?.value.trim() || "";
        const noteLine3 = document.getElementById('note-line3')?.value.trim() || "";
        if (noteLine1) worksheet.getCell('A33').value = noteLine1;
        if (noteLine2) worksheet.getCell('A34').value = noteLine2;
        if (noteLine3) worksheet.getCell('A35').value = noteLine3;

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