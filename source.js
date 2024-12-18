        let currentYear, currentMonth;
        let currentSelectedTime = { hour: 2, minute: 0, second: 0 }; // Default to 12:00

        const months = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];

            

function getYears() {
    const d = new Date();
    currentYear = d.getFullYear();
    currentMonth = d.getMonth(); 
    const yearSelect = document.getElementById('yearSelect');

    // Populate months in reverse order (Dec to Jan)
    for (let year = currentYear; year >= currentYear - 100; year--) {
        for (let i = months.length - 1; i >= 0; i--) {
            const month = months[i];
            const option = document.createElement('option');
            option.value = `${month} ${year}`;
            option.textContent = `${month} ${year}`;
            yearSelect.appendChild(option);
        }
    }

    // Set the default to the current month and year
    const defaultMonthYear = `${months[currentMonth]} ${currentYear}`;
    yearSelect.value = defaultMonthYear;

    // Event listener for when the user selects a new year/month
    yearSelect.addEventListener('change', function () {
        const selectedYearMonth = yearSelect.value.split(" ");
        currentMonth = months.indexOf(selectedYearMonth[0]);
        currentYear = parseInt(selectedYearMonth[1]);
        updateCalendar();
    });
}

// Function to update the days of the month based on the selected year and month
function generateDaysOfMonth() {
    const today = new Date(); 
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const daysOfMonthDiv = document.getElementById('daysOfMonth');
    daysOfMonthDiv.innerHTML = ''; // Clear previous content

    // Add empty spaces for the first week if the month doesn't start on Sunday
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty');
        daysOfMonthDiv.appendChild(emptyDiv);
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        // Check if the day has already passed
        const isPastDay = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (isPastDay) {
            dayDiv.classList.add('disabled'); // Add disabled styling
        } else {
            dayDiv.onclick = function () {
                selectDay(dayDiv); // Make day clickable
            };
        }

        daysOfMonthDiv.appendChild(dayDiv);
    }
}


// Modify generateDaysOfWeek to apply faded style
function generateDaysOfWeek() {
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
    const daysOfWeekDiv = document.getElementById('daysOfWeek');
    
    // Add day names with faded style
    daysOfWeek.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-of-week', 'faded'); 
        dayDiv.textContent = day;
        daysOfWeekDiv.appendChild(dayDiv);
    });
}

// Function to select a day and format the selected date
function selectDay(selectedDayDiv) {
    // Deselect any previously selected day
    const previouslySelectedDay = document.querySelector('.selected');
    console.log(previouslySelectedDay);
    if (previouslySelectedDay) {
        previouslySelectedDay.classList.remove('selected');
    }

    // Select the clicked day
    selectedDayDiv.classList.add('selected');

    // Update the input field with the selected date
    const formattedDate = getSelectedDate();
    if (formattedDate) {
        const inputField = document.querySelector('.date');
        inputField.value = formattedDate; // Update input with the selected date
    }
}


        // Function to go to the previous month
        function prevMonth() {
            if (currentMonth === 0) {
                currentMonth = 11; // December
                currentYear--;
            } else {
                currentMonth--;
            }
            updateCalendar();
        }

        // Function to go to the next month
        function nextMonth() {
            if (currentMonth === 11) {
                currentMonth = 0; // January
                currentYear++;
            } else {
                currentMonth++;
            }
            updateCalendar();
        }

// Function to update the calendar after changing the month or year
function updateCalendar() {
    const yearSelect = document.getElementById('yearSelect');
    yearSelect.value = `${months[currentMonth]} ${currentYear}`;
    generateDaysOfMonth();
}

let formattedDate;
let formattedFullTime;

function getSelectedDate() {
    const selectedDayDiv = document.querySelector('.selected');
    if (selectedDayDiv) {
        const selectedDay = selectedDayDiv.textContent;
        console.log(selectedDay);
        const selectedMonth = currentMonth + 1; // Months are 0-indexed
        const selectedYear = currentYear;

        // Format date as DD.MM.YYYY
        formattedDate = `${selectedDay.padStart(2, '0')}.${selectedMonth.toString().padStart(2, '0')}.${selectedYear}`;
        return formattedDate;
    }
    return null; 
}


window.onload = function () {
    getYears();
    generateDaysOfWeek();
    generateDaysOfMonth();


    // Initialize hidden elements
    const rootDiv = document.querySelector('.root');
    const datepicker = document.getElementById('datepicker');
    const clock = document.getElementById('clock');
    const dateImg = document.getElementById('dateimg');
    let dateImgOriginalSrc = "datepick1.png";
    let dateImgToggledSrc = "datepick2.png";

    rootDiv.hidden = true; 

    // Toggle visibility and change image source on clicking the image
    dateImg.onclick = function () {
        const isHidden = rootDiv.hidden;

        // Toggle visibility of root
        rootDiv.hidden = !isHidden;

        // Change the image source
        //dateImg.src = isHidden ? dateImgToggledSrc : dateImgOriginalSrc;

        if (isHidden) {
            // Trigger the dateBtn click event when root is shown
            document.getElementById('dateBtn').click();
        }
    };

    // Add event listeners for the "Date" and "Time" buttons
    document.getElementById('dateBtn').onclick = function () {
        clock.hidden = true;
        datepicker.hidden = false;
        this.classList.add('selected-tab');
        document.getElementById('timeBtn').classList.remove('selected-tab');

    };

    document.getElementById('timeBtn').onclick = function () {
            datepicker.hidden = true;
            clock.hidden = false;
            this.classList.add('selected-tab');
            document.getElementById('dateBtn').classList.remove('selected-tab');
        };

        document.getElementById('hourformatId').onclick = function () {
            let formatType=document.getElementById('hourformatId');
            formatType.textContent="AM";
            console.log("span");
        };

        document.getElementById('okBtn').onclick = function () {
    const formattedDate = getSelectedDate(); 
    if (formattedDate) {
        const inputField = document.querySelector('.date');
        inputField.value = formattedDate; // Set the selected date in the input
    }
    rootDiv.hidden = true; 
};

document.getElementById('cancelBtn').onclick = function () {
    const inputField = document.querySelector('.date');
    inputField.value = ''; // Reset input to the placeholder text
    rootDiv.hidden = true; 
};

    // Add the "Next" and "Prev" month buttons functionality
    document.getElementById('prevMonthBtn').onclick = prevMonth;
    document.getElementById('nextMonthBtn').onclick = nextMonth;
};

const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const clockRadius = 110;
const centerX = 150;
const centerY = 118;

let outerRadius = clockRadius - 50;
let innerRadius = clockRadius - 20;

const hourCount = 12;
const minuteCount = 60; // Full minute positions
let currentMode = "hour"; // Modes: "hour", "minute", "second"

const hourPositions = [];
const innerHourPositions = [];
const minutePositions = [];
const allMinutePositions = []; // Holds positions for all minutes
let cursorModePositions= []; 
let selectedPosition = 14;
let cursorX = null;
let cursorY = null;
let isMouseDown = false;

let canSelectedDrawn=true;
let cursorCircleDrawn=false;

calculatePositions();

function drawClock() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill the circle with a background color (gray)
    ctx.fillStyle = '#F4F4F4';
    ctx.beginPath();
    ctx.arc(centerX, centerY, clockRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw a small circle at the center of the clock
    ctx.fillStyle = '#FBE8CE';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    drawLine();

    if (currentMode === "hour") {
        selectedPosition=14;
        drawHourClock();
    } else {
        drawMinuteSecondClock();
    }
    canSelectedDrawn=true;
}

function calculatePositions(){
    for (let i = 0; i < hourCount; i++) {
        const angle = (i * Math.PI) / 6 - Math.PI / 2;
        const xOuter = centerX + Math.cos(angle) * outerRadius;
        const yOuter = centerY + Math.sin(angle) * outerRadius;
        const xInner = centerX + Math.cos(angle) * innerRadius;
        const yInner = centerY + Math.sin(angle) * innerRadius;
        hourPositions[i] = { x: xOuter, y: yOuter };
        innerHourPositions[i] = { x: xInner, y: yInner };
    }

    for (let i = 0; i < minuteCount; i++) {
        const angle = (i * Math.PI) / 30 - Math.PI / 2; // Adjust for 60 divisions
        const x = centerX + Math.cos(angle) * innerRadius;
        const y = centerY + Math.sin(angle) * innerRadius;

        allMinutePositions[i] = { x, y, value: i };
    }
}

function drawHourClock() {
    for (let i = 0; i < hourCount; i++) {

        const xOuter = hourPositions[i].x;
        const yOuter = hourPositions[i].y;
        const xInner = innerHourPositions[i].x;
        const yInner = innerHourPositions[i].y;


        if(canSelectedDrawn==true){
            selectedPosition=currentSelectedTime.hour;            
        }

        // Highlight outer circle
        if (selectedPosition === i) {
            ctx.beginPath();
            ctx.arc(xInner, yInner, 13, 0, Math.PI * 2);
            ctx.fillStyle = '#FBE8CE';
            ctx.fill();
        }

        // Highlight inner circle
        if (selectedPosition === i + hourCount) { // Adjust for inner circle positions
            ctx.beginPath();
            ctx.arc(xOuter, yOuter, 13, 0, Math.PI * 2);
            ctx.fillStyle = '#FBE8CE';
            ctx.fill();
        }

        ctx.font = "13px Arial";
        ctx.fillStyle = '#4E4E4E';
        ctx.fillText(i === 0 ? 12 : i+12, xOuter - 5, yOuter + 5);
        ctx.fillText(i === 0 ? 12 : i, xInner - 5, yInner + 5);
    }
}

function drawMinuteSecondClock() {
    minutePositions.length = 0; // Clear previous positions
    //allMinutePositions.length = 0; // Clear all-minute positions
    for (let i = 0; i < minuteCount; i++) {

        const x = allMinutePositions[i].x;
        const y = allMinutePositions[i].y;

        if(canSelectedDrawn==true && currentMode === "minute"){
            selectedPosition=currentSelectedTime.minute;
        }else{
            selectedPosition=currentSelectedTime.second;
        }

        if (i % 5 === 0) {
            minutePositions[i] = { x, y, value: i }; // Store only selectable positions
        }

        
        if (selectedPosition === i && i % 5 === 0) {
            ctx.beginPath();
            ctx.arc(x, y, 13, 0, Math.PI * 2);
            ctx.fillStyle = '#FBE8CE';
            ctx.fill();
        }else if(cursorCircleDrawn==true && selectedPosition === i){
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#FBE8CE';
            ctx.fill();
            cursorCircleDrawn=false;
        }

        ctx.font = "13px Arial";
        ctx.fillStyle = '#4E4E4E';
        if (i % 5 === 0) ctx.fillText(i, x - 5, y + 5); // Display only multiples of 5
    }
    //selectedPosition=null;
}

let cursor=false;
function drawLine() {
    if (cursorX !== null && cursorY !== null && selectedPosition === null) {
        const distFromCenter = Math.sqrt(
            Math.pow(cursorX - centerX, 2) + Math.pow(cursorY - centerY, 2)
        );
     
        if (distFromCenter <= clockRadius) { // Only draw if cursor is inside the main circle
            // Draw a line from the center to the cursor position

            cursorModePositions[currentMode]= { x: cursorX, y: cursorY };

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(cursorX, cursorY);
            ctx.strokeStyle = '#FBE8CE';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw the circle for the cursor
            ctx.beginPath();
            ctx.arc(cursorX, cursorY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#FBE8CE';
            ctx.fill();
            selectedPosition=null;
            cursor=false;
        }
    }else if(Object.keys(cursorModePositions).length>0 && cursorModePositions.hasOwnProperty(currentMode) && cursor==false && selectedPosition==null){
        tempX=cursorX;
        tempY=cursorY;

        cursorX=cursorModePositions[currentMode].x;
        cursorY=cursorModePositions[currentMode].y;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(cursorX, cursorY);
            ctx.strokeStyle = '#FBE8CE';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw the circle for the cursor
            ctx.beginPath();
            ctx.arc(cursorX, cursorY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#FBE8CE';
            ctx.fill();
            //selectedPosition=null;

            cursorX=tempX;
            cursorY=tempY;
          //cursor=true;
    }
  
    

    if (selectedPosition !== null) {
        const positions = currentMode === "hour"
    ? [...innerHourPositions, ...hourPositions]
    : currentMode === "minute" || currentMode === "second"
    ? allMinutePositions
    : [];


        const pos = positions[selectedPosition];
        if (pos) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = '#FBE8CE';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}


function startDrag(event) {
    isMouseDown = true;
    updateCursorPosition(event);
    handleSelection();
    drawClock();
}

function drag(event) {
    if (!isMouseDown) return;
    updateCursorPosition(event);
    handleSelection();
    drawClock();
}

function stopDrag() {
    isMouseDown = false;
    cursorCircleDrawn=true;
    if(currentMode=="hour"){
        //currentMode = "minute";
        selectedPosition=currentSelectedTime.hour;
    }

    drawClock();
}

function singleClick(event) {
    updateCursorPosition(event);
    handleSelection();
    drawClock();
}

function updateCursorPosition(event) {
    canSelectedDrawn=false;
    const rect = canvas.getBoundingClientRect();
    cursorX = event.clientX - rect.left;
    cursorY = event.clientY - rect.top;
    drawClock();
}


function switchToMode(mode, selPosition) {
    currentMode = mode;
    selectedPosition = selPosition; // Reset to ensure new mode doesn't conflict
    cursorX = null; // Reset cursor position
    cursorY = null;
    drawClock(); // Redraw the clock with updated mode
}




document.getElementById('time-unithourId').addEventListener('click', () => {
    //this.classList.add('selectedMode');
   // document.getElementById('time-unithourId').classList.remove('selectedMode');
   document.getElementById('time-unithourId').style.color="orange";
    document.getElementById('time-unitminuteID').style.color="black";
    document.getElementById('time-unitsecondID').style.color="black";
    outerRadius = clockRadius - 50;
    innerRadius = clockRadius - 20;
    //currentMode="hour";
    //drawClock();
    cursor=false;
    cursorCircleDrawn=true;
    switchToMode("hour", currentSelectedTime.hour);
    
});

document.getElementById('time-unitminuteID').addEventListener('click', () => {
    //this.classList.add('selectedMode');
    //document.getElementById('time-unitminuteID').classList.remove('selectedMode');
    document.getElementById('time-unithourId').style.color="black";
    document.getElementById('time-unitminuteID').style.color="orange";
    document.getElementById('time-unitsecondID').style.color="black";
    innerRadius = clockRadius - 50;
    //currentMode="minute";
    //drawClock();
    cursor=false;
    cursorCircleDrawn=true;
    switchToMode("minute", currentSelectedTime.minute);
    
});

document.getElementById('time-unitsecondID').addEventListener('click', () => {
    document.getElementById('time-unithourId').style.color="black";
    document.getElementById('time-unitminuteID').style.color="black";
    document.getElementById('time-unitsecondID').style.color="orange";
    innerRadius = clockRadius - 50;
    //currentMode="second";
    //drawClock();
    cursor=false;
    cursorCircleDrawn=true;
    switchToMode("second", currentSelectedTime.second);
    
});

document.getElementById('okTimeBtn').addEventListener('click', () => {
    const rootDiv = document.querySelector('.root');
    const formattedDate = getSelectedDate(); 
    if (formattedDate) {
        const inputField = document.querySelector('.date');
        inputField.value = formattedDate+" - "+ String(currentSelectedTime.hour).padStart(2, '0')+" : "+ String(currentSelectedTime.minute).padStart(2, '0'); // Set the selected date in the input
    }
    rootDiv.hidden = true; 
});

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', drag);
canvas.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mouseleave', stopDrag);
canvas.addEventListener('click', singleClick);

ctx.font = '16px Arial';
drawClock();



let currentSelectedDate = null;

let unitHour=document.getElementById('time-unithourId');
let unitMinute=document.getElementById('time-unitminuteID');
let unitSecond=document.getElementById('time-unitsecondID');


function setTime(hour, minute, second ) {
    // Update global variables for the selected time
    currentSelectedTime.hour = hour;
    currentSelectedTime.minute = minute;
    currentSelectedTime.second=second;
    cursorCircleDrawn=true;
    console.log("sel: "+currentSelectedTime.hour);

    // Automatically redraw the clock based on the current mode
    if (currentMode === "hour") {
        if (hour <= 12) {
            selectedPosition = hour === 12 ? 0 : hour; // Outer circle
        } else {
            selectedPosition = hour - 12 + hourCount; // Inner circle
        }

    } else if (currentMode === "minute") {
        selectedPosition = currentSelectedTime.minute; // Directly use minute
        
    } else if (currentMode === "second") {
        selectedPosition = currentSelectedTime.second; // Directly use second
    }
    unitHour.textContent=currentSelectedTime.hour;
        unitMinute.textContent=String(currentSelectedTime.minute).padStart(2, '0');
        unitSecond.textContent=String(currentSelectedTime.second).padStart(2, '0');
    drawClock(); // Redraw the clock
}


// Event listener for imgTimeNowId
document.getElementById('imgTimeNowId').addEventListener('click', () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond=now.getSeconds();

    //console.log(`Setting current time: ${currentHour}:${currentMinute}`);
    setTime(currentHour, currentMinute, currentSecond);
});

// Event listener for imgTimeNowId
document.getElementById('imgMorningId').addEventListener('click', () => {

    //console.log(`Setting current time: ${currentHour}:${currentMinute}`);
    setTime(8, 0, 0);
});

// Event listener for imgTimeNowId
document.getElementById('imgDayId').addEventListener('click', () => {

    const currentHour = 12;
    const currentMinute = 0;

    //console.log(`Setting current time: ${currentHour}:${currentMinute}`);
    setTime(12, 0, 0);
});

// Event listener for imgTimeNowId
document.getElementById('imgEveningId').addEventListener('click', () => {

    const currentHour = 18;
    const currentMinute = 0;

    //console.log(`Setting current time: ${currentHour}:${currentMinute}`);
    setTime(18, 0, 0);
});


// Updated handleSelection for logging all minutes
function handleSelection() {
    let found = false;

    if (currentMode === "hour") {
        for (let i = 0; i < hourPositions.length; i++) {
            const { x, y } = hourPositions[i];
            const dist = Math.sqrt(Math.pow(cursorX - x, 2) + Math.pow(cursorY - y, 2));
            if (dist < 13) {
                selectedPosition = i+12;
                found = true;
                currentSelectedTime.hour = i+12; // Update selected hour
                console.log("only pos "+selectedPosition);
                console.log("cur sel "+currentSelectedTime.hour);
                document.getElementById('time-unithourId').textContent = currentSelectedTime.hour;
                break;
            }else{
                selectedPosition=null;
                currentSelectedTime.hour=null;
            }
        }

        for (let i = 0; i < innerHourPositions.length; i++) {
            const { x, y } = innerHourPositions[i];
            const dist = Math.sqrt(Math.pow(cursorX - x, 2) + Math.pow(cursorY - y, 2));
            if (dist < 13) {
                selectedPosition = i;
                found = true;
                currentSelectedTime.hour = i ; // Update selected inner hour
                console.log("only pos "+selectedPosition);
                console.log("cur sel "+currentSelectedTime.hour);
                document.getElementById('time-unithourId').textContent = currentSelectedTime.hour;
                break;
            }
        }
    } else {
        for (let i = 0; i < minutePositions.length; i++) {
            const { x, y, value } = minutePositions[i] || {};
            const dist = Math.sqrt(Math.pow(cursorX - x, 2) + Math.pow(cursorY - y, 2));
            if (dist < 5) {
                selectedPosition = i;
                found = true;
                if(currentMode === "minute"){
                    currentSelectedTime.minute = value; // Update selected minute
                }else if(currentMode === "second"){
                    currentSelectedTime.second = value; // Update selected minute

                }

                //console.log(`Selected minute: ${value}`);
                
                break;
            }else{
                selectedPosition=null;
                currentSelectedTime.minute=null;
                currentSelectedTime.second=null;
            }
        }

        if (!found) {
            for (let i = 0; i < allMinutePositions.length; i++) {
                const { x, y, value } = allMinutePositions[i] || {};
                const dist = Math.sqrt(Math.pow(cursorX - x, 2) + Math.pow(cursorY - y, 2));
                if (dist < 13) {
                   // console.log(`Minute on clock (non-selectable): ${value}`);
                   if(currentMode === "minute"){
                   document.getElementById('time-unitminuteID').textContent = String(value).padStart(2, '0');
                   }else{
                    document.getElementById('time-unitsecondID').textContent = String(value).padStart(2, '0');
                   }
                    break;
                }
            }
        }
    }

    if (!found) {
        selectedPosition = null;
    }
}