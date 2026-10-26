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