       
       class psdatepicker{

        static currentYear; static currentMonth;
        static currentSelectedTime = { hour: 1, minute: 0, second: 0 }; // Default to 2:00

        static months = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];

            static formattedDate;
            static formattedFullTime;

            static canvas = document.getElementById('psdatepicker-clockCanvas');
            static ctx = this.canvas.getContext('2d');
            static clockRadius = 110;
            static centerX = this.canvas.width / 2;
            static centerY = this.canvas.height / 2;

            static outerRadius = this.clockRadius - 50;
            static innerRadius = this.clockRadius - 20;

            static hourCount = 12;
            static minuteCount = 60; // Full minute positions
            static currentMode = "hour"; // Modes: "hour", "minute", "second"

            static hourPositions = [];
            static innerHourPositions = [];
            static minutePositions = [];
            static allMinutePositions = []; // Holds positions for all minutes
            static cursorModePositions= []; 
            static selectedPosition = 1;
            static cursorX = null;
            static cursorY = null;
            static isMouseDown = false;

            static canSelectedDrawn=true;
            static cursorCircleDrawn=false;
            static cursor=false;

       }

function psdatepicker_getYears() {
    const d = new Date();
    psdatepicker.currentYear = d.getFullYear();
    currentMonth = d.getMonth(); 
    const yearSelect = document.getElementById('psdatepicker-yearSelect');

    // Populate months in reverse order (Dec to Jan)
    for (let year = psdatepicker.currentYear+50; year >= psdatepicker.currentYear - 50; year--) {
        for (let i = psdatepicker.months.length - 1; i >= 0; i--) {
            const month = psdatepicker.months[i];
            const option = document.createElement('option');
            option.value = `${month} ${year}`;
            option.textContent = `${month} ${year}`;
            yearSelect.appendChild(option);
        }
    }

    // Set the default to the current month and year
    const defaultMonthYear = `${psdatepicker.months[currentMonth]} ${psdatepicker.currentYear}`;
    yearSelect.value = defaultMonthYear;

    // Event listener for when the user selects a new year/month
    yearSelect.addEventListener('change', function () {
        const selectedYearMonth = yearSelect.value.split(" ");
        currentMonth = psdatepicker.months.indexOf(selectedYearMonth[0]);
        psdatepicker.currentYear = parseInt(selectedYearMonth[1]);
        psdatepicker_updateCalendar();
    });
}

// Function to update the days of the month based on the selected year and month
function psdatepicker_generateDaysOfMonth() {
    const today = new Date(); 
    const daysInMonth = new Date(psdatepicker.currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(psdatepicker.currentYear, currentMonth, 1).getDay();

    const daysOfMonthDiv = document.getElementById('psdatepicker-daysOfMonth');
    daysOfMonthDiv.innerHTML = ''; // Clear previous content
    let allCounter=0;

    // Add empty spaces for the first week if the month doesn't start on Sunday
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty');
        daysOfMonthDiv.appendChild(emptyDiv);
        allCounter++;
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('psdatepicker-day');
        dayDiv.textContent = day;

                // Check if the day is the current date
                const isToday =
                psdatepicker.currentYear === today.getFullYear() &&
                currentMonth === today.getMonth() &&
                day === today.getDate();
    
            if (isToday) {
                dayDiv.classList.add('selected'); // Auto-select today's date
                psdatepicker_getSelectedDate()
            }

        // Check if the day has already passed
        const isPastDay = new Date(psdatepicker.currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (isPastDay) {
            dayDiv.classList.add('disabled'); // Add disabled styling
        } else {
            dayDiv.onclick = function () {
                psdatepicker_selectDay(dayDiv); // Make day clickable
            };
        }

        daysOfMonthDiv.appendChild(dayDiv);
        allCounter++;
    }

    if(allCounter>35){
        document.getElementById('psdatepicker-rootId').style.height="420px"
    }else{
        document.getElementById('psdatepicker-rootId').style.height="380px"
    }

}


// Modify generateDaysOfWeek to apply faded style
function psdatepicker_generateDaysOfWeek() {
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
    const daysOfWeekDiv = document.getElementById('psdatepicker-daysOfWeek');
    
    // Add day names with faded style
    daysOfWeek.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('psdatepicker-day-of-week', 'faded'); 
        dayDiv.textContent = day;
        daysOfWeekDiv.appendChild(dayDiv);
    });
}

// Function to select a day and format the selected date
function psdatepicker_selectDay(selectedDayDiv) {
    // Deselect any previously selected day
    const previouslySelectedDay = document.querySelector('.selected');
    if (previouslySelectedDay) {
        previouslySelectedDay.classList.remove('selected');
    }

    // Select the clicked day
    selectedDayDiv.classList.add('selected');

    // Update the input field with the selected date
    const formattedDate = psdatepicker_getSelectedDate();
    if (formattedDate) {
        const inputField = document.querySelector('.psdatepicker-date');
        inputField.value = formattedDate; // Update input with the selected date
    }
}
        // Function to go to the previous month
function psdatepicker_prevMonth() {
        if (currentMonth === 0) {
            currentMonth = 11; // December
            psdatepicker.currentYear--;
        }else {
            currentMonth--;
        }
        psdatepicker_updateCalendar();
}

        // Function to go to the next month
function psdatepicker_nextMonth() {
    if (currentMonth === 11) {
        currentMonth = 0; // January
        psdatepicker.currentYear++;
    } else {
        currentMonth++;
    }
    psdatepicker_updateCalendar();
}

// Function to update the calendar after changing the month or year
function psdatepicker_updateCalendar() {
    const yearSelect = document.getElementById('psdatepicker-yearSelect');
    yearSelect.value = `${psdatepicker.months[currentMonth]} ${psdatepicker.currentYear}`;
    psdatepicker_generateDaysOfMonth();
}



function psdatepicker_getSelectedDate() {
    const selectedDayDiv = document.querySelector('.selected');
    if (selectedDayDiv) {
        const selectedDay = selectedDayDiv.textContent;
        const selectedMonth = currentMonth + 1; // Months are 0-indexed
        const selectedYear = psdatepicker.currentYear;

        // Format date as DD.MM.YYYY
        psdatepicker.formattedDate = `${selectedDay.padStart(2, '0')}.${selectedMonth.toString().padStart(2, '0')}.${selectedYear}`;
        return psdatepicker.formattedDate;
    }
    return null; 
}

function psdatepicker_loadContent () {
    psdatepicker_getYears();
    psdatepicker_generateDaysOfWeek();
    psdatepicker_generateDaysOfMonth();
    document.getElementById('psdatepicker-time-unithourId').classList.add('seltime');


    // Initialize hidden elements
    const rootDiv = document.querySelector('.psdatepicker-root');
    const datepicker = document.getElementById('psdatepicker-datepicker');
    const clock = document.getElementById('psdatepicker-clock');
    const dateImg = document.getElementById('psdatepicker-dateimg');
    let dateImgOriginalSrc = "DateTime.svg";
    let dateImgToggledSrc = "DateTimeClicked.svg";

    rootDiv.hidden = true; 

    // Toggle visibility and change image source on clicking the image
    dateImg.onclick = function () {
        const isHidden = rootDiv.hidden;

        // Toggle visibility of root
        rootDiv.hidden = !isHidden;

        // Change the image source
        dateImg.src = isHidden ? dateImgToggledSrc : dateImgOriginalSrc;

        if (isHidden) {
            // Trigger the dateBtn click event when root is shown
            document.getElementById('psdatepicker-dateBtn').click();
        }
    };

    // Add event listeners for the "Date" and "Time" buttons
    document.getElementById('psdatepicker-dateBtn').onclick = function () {
        clock.hidden = true;
        datepicker.hidden = false;
        document.getElementById('psdatepicker-CalendarSVG').src = 'CalendarClicked.svg';
        document.getElementById('psdatepicker-TimeSVG').src = 'Time.svg';
        this.classList.add('selected-tab');
        document.getElementById('psdatepicker-timeBtn').classList.remove('selected-tab');
    };

    document.getElementById('psdatepicker-timeBtn').onclick = function () {
            datepicker.hidden = true;
            clock.hidden = false;
            document.getElementById('psdatepicker-CalendarSVG').src = 'Calendar.svg';
            document.getElementById('psdatepicker-TimeSVG').src = 'TimeClicked.svg';
            this.classList.add('selected-tab');
            document.getElementById('psdatepicker-dateBtn').classList.remove('selected-tab');
        };

        document.getElementById('psdatepicker-hourformatId').onclick = function () {
            let formatType=document.getElementById('psdatepicker-hourformatId');
            if(formatType.textContent=="AM"){
                formatType.textContent="PM";
            }else{
                formatType.textContent="AM";
            }            
        };

document.getElementById('psdatepicker-okBtn').onclick = function () {
    const formattedDate = psdatepicker_getSelectedDate(); 
    if (formattedDate) {
        const inputField = document.querySelector('.psdatepicker-date');
        inputField.value = formattedDate; // Set the selected date in the input
    }
    rootDiv.hidden = true; 
};

document.getElementById('psdatepicker-cancelBtn').onclick = function () {
    const inputField = document.querySelector('.psdatepicker-date');
    inputField.value = ''; // Reset input to the placeholder text
    rootDiv.hidden = true; 
};

    // Add the "Next" and "Prev" month buttons functionality
    document.getElementById('psdatepicker-prevMonthBtn').onclick = psdatepicker_prevMonth;
    document.getElementById('psdatepicker-nextMonthBtn').onclick = psdatepicker_nextMonth;
}

window.onload = psdatepicker_loadContent;

psdatepicker_calculatePositions();

function psdatepicker_drawClock() {
    psdatepicker.ctx.clearRect(0, 0, psdatepicker.canvas.width, psdatepicker.canvas.height);

    // Fill the circle with a background color (gray)
    psdatepicker.ctx.fillStyle = '#F4F4F4';
    psdatepicker.ctx.beginPath();
    psdatepicker.ctx.arc(psdatepicker.centerX, psdatepicker.centerY, psdatepicker.clockRadius, 0, Math.PI * 2);
    psdatepicker.ctx.fill();

    // Draw a small circle at the center of the clock
    psdatepicker.ctx.fillStyle = '#FBE8CE';
    psdatepicker.ctx.beginPath();
    psdatepicker.ctx.arc(psdatepicker.centerX, psdatepicker.centerY, 5, 0, Math.PI * 2);
    psdatepicker.ctx.fill();

    psdatepicker_drawLine();

    if (psdatepicker.currentMode === "hour" || psdatepicker.currentMode === "amPmHour") {
        psdatepicker.selectedPosition=14;
        psdatepicker_drawHourClock();
    } else {
        psdatepicker_drawMinuteSecondClock();
    }
    psdatepicker.canSelectedDrawn=true;
}

function psdatepicker_calculatePositions(){
    for (let i = 0; i < psdatepicker.hourCount; i++) {
        const angle = (i * Math.PI) / 6 - Math.PI / 2;
        const xOuter = psdatepicker.centerX + Math.cos(angle) * psdatepicker.outerRadius;
        const yOuter = psdatepicker.centerY + Math.sin(angle) * psdatepicker.outerRadius;
        const xInner = psdatepicker.centerX + Math.cos(angle) * psdatepicker.innerRadius;
        const yInner = psdatepicker.centerY + Math.sin(angle) * psdatepicker.innerRadius;
        psdatepicker.hourPositions[i] = { x: xOuter, y: yOuter };
        psdatepicker.innerHourPositions[i] = { x: xInner, y: yInner };
    }

    for (let i = 0; i < psdatepicker.minuteCount; i++) {
        const angle = (i * Math.PI) / 30 - Math.PI / 2; // Adjust for 60 divisions
        const x = psdatepicker.centerX + Math.cos(angle) * psdatepicker.innerRadius;
        const y = psdatepicker.centerY + Math.sin(angle) * psdatepicker.innerRadius;

        psdatepicker.allMinutePositions[i] = { x, y, value: i };
    }
}

function psdatepicker_drawHourClock() {
    for (let i = 0; i < psdatepicker.hourCount; i++) {

        const xOuter = psdatepicker.hourPositions[i].x;
        const yOuter = psdatepicker.hourPositions[i].y;
        const xInner = psdatepicker.innerHourPositions[i].x;
        const yInner = psdatepicker.innerHourPositions[i].y;


        if(psdatepicker.canSelectedDrawn==true){
            psdatepicker.selectedPosition=psdatepicker.currentSelectedTime.hour;        
        }

        // Highlight outer circle
        if (psdatepicker.selectedPosition === i) {
            psdatepicker.ctx.beginPath();
            psdatepicker.ctx.arc(xInner, yInner, 13, 0, Math.PI * 2);
            psdatepicker.ctx.fillStyle = '#FBE8CE';
            psdatepicker.ctx.fill();
        }

        // Highlight inner circle
        if (psdatepicker.selectedPosition === i + psdatepicker.hourCount && psdatepicker.currentMode!="amPmHour") { // Adjust for inner circle positions
            psdatepicker.ctx.beginPath();
            psdatepicker.ctx.arc(xOuter, yOuter, 13, 0, Math.PI * 2);
            psdatepicker.ctx.fillStyle = '#FBE8CE';
            psdatepicker.ctx.fill();
        }

        psdatepicker.ctx.font = "13px Arial";
        psdatepicker.ctx.fillStyle = '#4E4E4E';
        if(psdatepicker.currentMode=="hour"){
        psdatepicker.ctx.fillText(i === 0 ? '00' : i+12, xOuter - 5, yOuter + 5);
        }
        psdatepicker.ctx.fillText(i === 0 ? 12 : i, xInner - 5, yInner + 5);
    }
}

function psdatepicker_drawMinuteSecondClock() {
    psdatepicker.minutePositions.length = 0; // Clear previous positions
    for (let i = 0; i < psdatepicker.minuteCount; i++) {

        const x = psdatepicker.allMinutePositions[i].x;
        const y = psdatepicker.allMinutePositions[i].y;

        if(psdatepicker.canSelectedDrawn==true && psdatepicker.currentMode === "minute"){
            psdatepicker.selectedPosition=psdatepicker.currentSelectedTime.minute;
        }else{
            psdatepicker.selectedPosition=psdatepicker.currentSelectedTime.second;
        }

        if (i % 5 === 0) {
            psdatepicker.minutePositions[i] = { x, y, value: i }; // Store only selectable positions
        }

        
        if (psdatepicker.selectedPosition === i && i % 5 === 0) {
            psdatepicker.ctx.beginPath();
            psdatepicker.ctx.arc(x, y, 13, 0, Math.PI * 2);
            psdatepicker.ctx.fillStyle = '#FBE8CE';
            psdatepicker.ctx.fill();
        }else if(psdatepicker.cursorCircleDrawn==true && psdatepicker.selectedPosition === i){
            psdatepicker.ctx.beginPath();
            psdatepicker.ctx.arc(x, y, 5, 0, Math.PI * 2);
            psdatepicker.ctx.fillStyle = '#FBE8CE';
            psdatepicker.ctx.fill();
            psdatepicker.cursorCircleDrawn=false;
        }

        psdatepicker.ctx.font = "13px Arial";
        psdatepicker.ctx.fillStyle = '#4E4E4E';
        if (i % 5 === 0) psdatepicker.ctx.fillText(i, x - 5, y + 5); // Display only multiples of 5
    }
}


function psdatepicker_drawLine() {
    if (psdatepicker.cursorX !== null && psdatepicker.cursorY !== null && psdatepicker.selectedPosition === null) {
        const distFromCenter = Math.sqrt(
            Math.pow(psdatepicker.cursorX - psdatepicker.centerX, 2) + Math.pow(psdatepicker.cursorY - psdatepicker.centerY, 2)
        );
     
        if (distFromCenter <= psdatepicker.clockRadius) { // Only draw if cursor is inside the main circle
            // Draw a line from the center to the cursor position

            psdatepicker.cursorModePositions[psdatepicker.currentMode]= { x: psdatepicker.cursorX, y: psdatepicker.cursorY };

            psdatepicker.ctx.beginPath();
            psdatepicker.ctx.moveTo(psdatepicker.centerX, psdatepicker.centerY);
            psdatepicker.ctx.lineTo(psdatepicker.cursorX, psdatepicker.cursorY);
            psdatepicker.ctx.strokeStyle = '#FBE8CE';
            psdatepicker.ctx.lineWidth = 2;
            psdatepicker.ctx.stroke();

            // Draw the circle for the cursor
            psdatepicker.ctx.beginPath();
            psdatepicker.ctx.arc(psdatepicker.cursorX, psdatepicker.cursorY, 5, 0, Math.PI * 2);
            psdatepicker.ctx.fillStyle = '#FBE8CE';
            psdatepicker.ctx.fill();
            psdatepicker.selectedPosition=null;
            psdatepicker.cursor=false;
        }
    }else if(Object.keys(psdatepicker.cursorModePositions).length>0 && psdatepicker.cursorModePositions.hasOwnProperty(psdatepicker.currentMode) && psdatepicker.cursor==false && psdatepicker.selectedPosition==null){
            tempX=psdatepicker.cursorX;
            tempY=psdatepicker.cursorY;

            psdatepicker.cursorX=psdatepicker.cursorModePositions[psdatepicker.currentMode].x;
            psdatepicker.cursorY=psdatepicker.cursorModePositions[psdatepicker.currentMode].y;

            psdatepicker.ctx.beginPath();
            psdatepicker.ctx.moveTo(psdatepicker.centerX, psdatepicker.centerY);
            psdatepicker.ctx.lineTo(psdatepicker.cursorX, psdatepicker.cursorY);
            psdatepicker.ctx.strokeStyle = '#FBE8CE';
            psdatepicker.ctx.lineWidth = 2;
            psdatepicker.ctx.stroke();

            // Draw the circle for the cursor
            psdatepicker.ctx.beginPath();
            psdatepicker.ctx.arc(psdatepicker.cursorX, psdatepicker.cursorY, 5, 0, Math.PI * 2);
            psdatepicker.ctx.fillStyle = '#FBE8CE';
            psdatepicker.ctx.fill();

            psdatepicker.cursorX=tempX;
            psdatepicker.cursorY=tempY;
    }

            if (psdatepicker.selectedPosition !== null) {
            const positions = psdatepicker.currentMode === "hour"
            ? [...psdatepicker.innerHourPositions, ...psdatepicker.hourPositions]
            : psdatepicker.currentMode === "amPmHour"
            ? psdatepicker.innerHourPositions // Use psdatepicker.innerHourPositions for am/pm mode
            : psdatepicker.currentMode === "minute" || psdatepicker.currentMode === "second"
            ? psdatepicker.allMinutePositions
            : [];


            const pos = positions[psdatepicker.selectedPosition];
            if (pos) {
                psdatepicker.ctx.beginPath();
                psdatepicker.ctx.moveTo(psdatepicker.centerX, psdatepicker.centerY);
                psdatepicker.ctx.lineTo(pos.x, pos.y);
                psdatepicker.ctx.strokeStyle = '#FBE8CE';
                psdatepicker.ctx.lineWidth = 2;
                psdatepicker.ctx.stroke();
            }
    }
}


function psdatepicker_startDrag(event) {
    psdatepicker.isMouseDown = true;
    psdatepicker_updateCursorPosition(event);
    psdatepicker_handleSelection();
    psdatepicker_drawClock();
}

function psdatepicker_drag(event) {
    if (!psdatepicker.isMouseDown) return;
    psdatepicker_updateCursorPosition(event);
    psdatepicker_handleSelection();
    psdatepicker_drawClock();
}

function psdatepicker_stopDrag() {
    psdatepicker.isMouseDown = false;
    psdatepicker.cursorCircleDrawn=true;

    psdatepicker_drawClock();
}

function psdatepicker_singleClick(event) {
    psdatepicker_updateCursorPosition(event);
    psdatepicker_handleSelection();
    psdatepicker_drawClock();
}

function psdatepicker_updateCursorPosition(event) {
    psdatepicker.canSelectedDrawn=false;
    const rect = psdatepicker.canvas.getBoundingClientRect();
    psdatepicker.cursorX = event.clientX - rect.left;
    psdatepicker.cursorY = event.clientY - rect.top;
    psdatepicker_drawClock();
}


function psdatepicker_switchToMode(mode, selPosition) {
    psdatepicker.currentMode = mode;
    psdatepicker.selectedPosition = selPosition; // Reset to ensure new mode doesn't conflict
    psdatepicker.cursorX = null; // Reset cursor position
    psdatepicker.cursorY = null;
    psdatepicker_drawClock(); // Redraw the clock with updated mode
}

function psdatepicker_setActiveUnit(unit) {
    const units = {
        hour: 'psdatepicker-time-unithourId',
        minute: 'psdatepicker-time-unitminuteID',
        second: 'psdatepicker-time-unitsecondID'
    };
    
    // Reset all unit styles to default
    Object.values(units).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('seltime'); // Remove the active class
        }
    });
    
    // Highlight the selected unit
    const activeElement = document.getElementById(units[unit]);
    if (activeElement) {
        activeElement.classList.add('seltime'); // Add the active class
    }

    // Adjust clock settings based on the selected unit
    psdatepicker.innerRadius = psdatepicker.clockRadius - 50;
    psdatepicker.outerRadius = unit === 'hour' ? psdatepicker.clockRadius - 50 : psdatepicker.outerRadius;
    psdatepicker.cursor = false;
    psdatepicker.cursorCircleDrawn = true;

    // Switch to the selected mode
    const selectedValue = psdatepicker.currentSelectedTime[unit];
    psdatepicker_switchToMode(unit, selectedValue);
}

// Event listeners for each time unit
document.getElementById('psdatepicker-time-unithourId').addEventListener('click', () => psdatepicker_setActiveUnit('hour'));
document.getElementById('psdatepicker-time-unitminuteID').addEventListener('click', () => psdatepicker_setActiveUnit('minute'));
document.getElementById('psdatepicker-time-unitsecondID').addEventListener('click', () => psdatepicker_setActiveUnit('second'));

document.getElementById('psdatepicker-okTimeBtn').addEventListener('click', () => {
    const rootDiv = document.querySelector('.psdatepicker-root');
    const formattedDate = psdatepicker_getSelectedDate(); 
    if (formattedDate) {
        const inputField = document.querySelector('.psdatepicker-date');
        inputField.value = formattedDate+" - "+ String(psdatepicker.currentSelectedTime.hour).padStart(2, '0')+":"+ String(psdatepicker.currentSelectedTime.minute).padStart(2, '0'); // Set the selected date in the input
    }
    rootDiv.hidden = true; 
});

document.getElementById('psdatepicker-colonId').addEventListener('click', () => {
    let format=document.getElementById('psdatepicker-hourformatId'); 
    let tempHour=document.getElementById('psdatepicker-time-unithourId'); 
        if(format.style.display=="none"){
            psdatepicker_switchToMode("amPmHour", psdatepicker.selectedPosition);
            format.style.display="initial"      
            psdatepicker_setTime(psdatepicker.currentSelectedTime.hour, psdatepicker.currentSelectedTime.minute, psdatepicker.currentSelectedTime.second);
                tempHour.textContent=psdatepicker.currentSelectedTime.hour;                    
        }else{ 
            psdatepicker_setTime(psdatepicker.currentSelectedTime.hour, psdatepicker.currentSelectedTime.minute, psdatepicker.currentSelectedTime.second);
            psdatepicker_switchToMode("hour", psdatepicker.selectedPosition);
            document.getElementById('psdatepicker-time-unithourId').textContent=psdatepicker.currentSelectedTime.hour;
            format.style.display="none"
        }
});

psdatepicker.canvas.addEventListener('mousedown', psdatepicker_startDrag);
psdatepicker.canvas.addEventListener('mousemove', psdatepicker_drag);
psdatepicker.canvas.addEventListener('mouseup', psdatepicker_stopDrag);
psdatepicker.canvas.addEventListener('mouseleave', psdatepicker_stopDrag);
psdatepicker.canvas.addEventListener('click', psdatepicker_singleClick);

psdatepicker.ctx.font = '16px Arial';
psdatepicker_drawClock();

function psdatepicker_setTime(hour, minute, second ) {
    let unitHour=document.getElementById('psdatepicker-time-unithourId');
    let unitMinute=document.getElementById('psdatepicker-time-unitminuteID');
    let unitSecond=document.getElementById('psdatepicker-time-unitsecondID');
    // Update global variables for the selected time
    psdatepicker.currentSelectedTime.hour = hour;
    psdatepicker.currentSelectedTime.minute = minute;
    psdatepicker.currentSelectedTime.second=second;
    psdatepicker.cursorCircleDrawn=true;
    let format=document.getElementById('psdatepicker-hourformatId'); 

    // Automatically redraw the clock based on the current mode
    if (psdatepicker.currentMode === "hour") {

        if (hour <= 12) {
            psdatepicker.selectedPosition = hour === 12 ? 0 : hour; // Outer circle
        } else {
            psdatepicker.selectedPosition = hour - 12 + psdatepicker.hourCount; // Inner circle          
        }

    }else if(psdatepicker.currentMode === "amPmHour"){
        
        if (psdatepicker.currentSelectedTime.hour<=12 && format.textContent === "AM") {

            psdatepicker.selectedPosition = psdatepicker.currentSelectedTime.hour // Outer circle
            format.textContent="AM";
        }else if (psdatepicker.currentSelectedTime.hour<=12 && format.textContent === "PM"){
            psdatepicker.currentSelectedTime.hour+=12;
            psdatepicker.selectedPosition=psdatepicker.currentSelectedTime.hour;
            format.textContent="PM";
        }else{
            psdatepicker.currentSelectedTime.hour-=12;
            psdatepicker.selectedPosition=psdatepicker.currentSelectedTime.hour;
            format.textContent="PM";
        }

    } else if (psdatepicker.currentMode === "minute") {
        psdatepicker.selectedPosition = psdatepicker.currentSelectedTime.minute; // Directly use minute
        
    } else if (psdatepicker.currentMode === "second") {
        psdatepicker.selectedPosition = psdatepicker.currentSelectedTime.second; // Directly use second
    }
        unitHour.textContent=psdatepicker.currentSelectedTime.hour;
        unitMinute.textContent=String(psdatepicker.currentSelectedTime.minute).padStart(2, '0');
        unitSecond.textContent=String(psdatepicker.currentSelectedTime.second).padStart(2, '0');
        psdatepicker_drawClock(); // Redraw the clock
}


// Predefined times
function psdatepicker_timeSlctBtn(btnMode){
    
    switch(btnMode){
        case 'now':
            const now = new Date();
            psdatepicker_setTime(now.getHours(), now.getMinutes(), now.getSeconds());
            break;
        case 'morning':
            psdatepicker_setTime(8, 0, 0);
            break
        case 'day':
            psdatepicker_setTime(12, 0, 0);
            break;   
        case 'night':
            psdatepicker_setTime(18, 0, 0);
            break;
    }
}


// Updated handleSelection for logging all minutes
function psdatepicker_handleSelection() {
    let found = false;

    if (psdatepicker.currentMode === "hour" || psdatepicker.currentMode === "amPmHour") {
        for (let i = 0; i < psdatepicker.hourPositions.length; i++) {
            const { x, y } = psdatepicker.hourPositions[i];
            const dist = Math.sqrt(Math.pow(psdatepicker.cursorX - x, 2) + Math.pow(psdatepicker.cursorY - y, 2));
            if (dist < 13 && psdatepicker.currentMode !="amPmHour") {
                psdatepicker.selectedPosition = i+12;
                found = true;
                psdatepicker.currentSelectedTime.hour = i+12; // Update selected hour
                document.getElementById('psdatepicker-time-unithourId').textContent = psdatepicker.currentSelectedTime.hour;
                if(psdatepicker.isMouseDown==false){
                    psdatepicker_setActiveUnit('minute');    
                }                
                break;
            }else{
                psdatepicker.selectedPosition=null;
                psdatepicker.currentSelectedTime.hour=null;
            }
        }

        for (let i = 0; i < psdatepicker.innerHourPositions.length; i++) {
            const { x, y } = psdatepicker.innerHourPositions[i];
            const dist = Math.sqrt(Math.pow(psdatepicker.cursorX - x, 2) + Math.pow(psdatepicker.cursorY - y, 2));
            if (dist < 13) {
                psdatepicker.selectedPosition = i;
                found = true;
                psdatepicker.currentSelectedTime.hour = i ; // Update selected inner hour
                document.getElementById('psdatepicker-time-unithourId').textContent = psdatepicker.currentSelectedTime.hour;
                if(psdatepicker.isMouseDown==false){
                    psdatepicker_setActiveUnit('minute');  
                }
                break;
            }
        }
    } else {
        for (let i = 0; i < psdatepicker.minutePositions.length; i++) {
            const { x, y, value } = psdatepicker.minutePositions[i] || {};
            const dist = Math.sqrt(Math.pow(psdatepicker.cursorX - x, 2) + Math.pow(psdatepicker.cursorY - y, 2));
            if (dist < 5) {
                psdatepicker.selectedPosition = i;
                found = true;
                    if(psdatepicker.currentMode === "minute"){
                        psdatepicker.currentSelectedTime.minute = value; // Update selected minute

                    }else if(psdatepicker.currentMode === "second"){
                        psdatepicker.currentSelectedTime.second = value; // Update selected minute

                    }
                break;
            }else{
                psdatepicker.selectedPosition=null;
                if(psdatepicker.currentMode === "minute"){
                    psdatepicker.currentSelectedTime.minute=null;
                }else{
                    psdatepicker.currentSelectedTime.second=null;
                }                
            }
        }

        if (!found) {
            for (let i = 0; i < psdatepicker.allMinutePositions.length; i++) {
                const { x, y, value } = psdatepicker.allMinutePositions[i] || {};
                const dist = Math.sqrt(Math.pow(psdatepicker.cursorX - x, 2) + Math.pow(psdatepicker.cursorY - y, 2));
                if (dist < 13) {
                   if(psdatepicker.currentMode === "minute"){
                    psdatepicker.currentSelectedTime.minute = value; // Update selected minute
                        if(psdatepicker.isMouseDown==false){
                            psdatepicker_setActiveUnit('second');    
                        }
                        document.getElementById('psdatepicker-time-unitminuteID').textContent = String(value).padStart(2, '0');
                    }else{
                        psdatepicker.currentSelectedTime.second = value; // Update selected minute
                        document.getElementById('psdatepicker-time-unitsecondID').textContent = String(value).padStart(2, '0');
                    }                        
                        break;
                }
            }
        }
    }

    if (!found) {
        psdatepicker.selectedPosition = null;
    }
}