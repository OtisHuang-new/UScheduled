import { useState } from 'react';

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [content, setContent] = useState("");
    const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`);
    const [endDate, setEndDate] = useState(`${new Date().getFullYear()}-01-01`);
    const start_line = "#	Mã MH	Tên MH	TC	Lớp HP	Học Kỳ	TA	HL	I2	Lịch LT	Lịch TH	GV-LT	GV-TH	GV-TG";
    const end_line = `Copyright ${new Date().getFullYear()} by Chương trình đề án - Khoa CNTT, ĐH.KHTN`;
    const mapping = { "T2": "MO", "T3": "TU", "T4": "WE", "T5": "TH", "T6": "FR", "T7": "SA", "CN": "SU" };
    const convert = { "T2": 1, "T3": 2, "T4": 3, "T5": 4, "T6": 5, "T7": 6, "CN": 0 };
    
    const handleSplit = () => {
        if (!content || typeof content.split !== 'function') {
            throw new Error("Dữ liệu không đúng chuẩn");
          }
        
        const lines = content?.split('\n') || [];
        let startIdx = -1;
        for(let i = 0; i < lines.length; i++){
            if(lines[i] === start_line){
                startIdx = i;
                break;
            }
        }
        if(startIdx === -1){
            throw new Error("Dữ liệu không đúng chuẩn");
        }else if(startIdx === lines.length - 1){
            throw new Error("Không có Dữ liệu lịch thi");
        }        
        startIdx++;

        let index = startIdx;
        while(lines[index] !== end_line && index < lines.length){
          let line = lines[index].split("\t");
          while(line.length < 3){
            lines[index - 1] += ", " + lines[index];
            // console.log(lines[index - 1]);
            lines.splice(index, 1);
            if(lines[index] !== end_line){
                line = lines[index].split("\t");
            }else
                break;
          }
          index++;
        }
        
        // index = startIdx;
        // while(lines[index] !== end_line && index < lines.length){
        //   console.log(lines[index].split("\t"));
        //   index++;
        // }
        return {'lines': lines, 'startIdx': startIdx};
    }
    const createCalendarToFile = () => {
        try{
            if(startDate > endDate) throw new Error("Ngày bắt đầu hoặc ngày kết thúc không hợp lệ");
            const splited = handleSplit();
            const lines = splited.lines;
            let startIdx = splited.startIdx;
            let myCalendar = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MyReactApp//NONSGML v1.0//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:${"Thời khóa biểu " + lines[startIdx - 4]}\nX-WR-TIMEZONE:Asia/Ho_Chi_Minh\n`;
            const fileName = `UScheduled_${lines[startIdx - 4]}`;

            while(lines[startIdx] !== end_line && startIdx < lines.length - 1){
                const line = lines[startIdx].split('\t');


                const myEvent   = `BEGIN:VEVENT\n`
                                + `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}\n`
                                + `LOCATION:\n`
                                + `STATUS:CONFIRMED\n`;

                let theory = line[9].split(" ");
                let experiment = line[10].split(" ");
                if(theory[0] !== ""){
                    const st = new Date(startDate);
                    while (st.getDay() !== convert[theory[0]]) { 
                        st.setDate(st.getDate() + 1);
                    }
                    // console.log(st.toISOString().split("T")[0]);
                    let event = myEvent;
                    event   +=`UID:LT${line[0] + line[1]}@myCalendar.com\n`
                            +`SUMMARY:${line[2]} (Lý thuyết)\n`
                            +`DESCRIPTION:Mã môn học: ${line[1]}\\nSố tín chỉ: ${line[3]}\\nPhòng: ${theory[2] ? theory[2].replace(/[()]/g, "") : "Chưa cập nhật"}\\n`
                            +`GV:${line[11]}\\nGVTG:${((line[13].length !== 0) ? (line[13]) : "")}\n`
                            +`DTSTART:${new Date(`${st.toISOString().split("T")[0]}T${theory[1].split("-")[0]}:00+07:00`).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}\n`
                            +`DTEND:${new Date(`${st.toISOString().split("T")[0]}T${theory[1].split("-")[1]}:00+07:00`).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}\n`
                            +`RRULE:FREQ=WEEKLY;UNTIL=${new Date(`${endDate}T23:59:00+07:00`).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"};BYDAY=${mapping[theory[0]] || "MO"}\n`
                            +`END:VEVENT\n`;
                    // console.log(event);
                    myCalendar += event;
                }

                if(experiment[0] !== ""){
                    const st = new Date(startDate);
                    while (st.getDay() !== convert[experiment[0]]) { 
                        st.setDate(st.getDate() + 1);
                    }
                    st.setDate(st.getDate() + 7);
                    let event = myEvent;
                    event   +=`UID:TH${line[0] + line[1]}@myCalendar.com\n`
                            +`SUMMARY:${line[2]} (Thực Hành)\n`
                            +`DESCRIPTION:Mã môn học: ${line[1]}\\nSố tín chỉ: ${line[3]}\\nPhòng: ${experiment[2] ? experiment[2].replace(/[()]/g, "") : "Chưa cập nhật"}\\n`
                            +`GV:${line[12]}\\nGVTG:${((line[13].length !== 0) ? (line[13]) : "")}\n`
                            +`DTSTART:${new Date(`${st.toISOString().split("T")[0]}T${experiment[1].split("-")[0]}:00+07:00`).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}\n`
                            +`DTEND:${new Date(`${st.toISOString().split("T")[0]}T${experiment[1].split("-")[1]}:00+07:00`).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}\n`
                            +`EXDATE:${startDate.replace(/-/g,"")}\n`
                            +`RRULE:FREQ=WEEKLY;UNTIL=${new Date(`${endDate}T23:59:00+07:00`).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"};BYDAY=${mapping[experiment[0]] || "MO"}\n`
                            +`END:VEVENT\n`;
                    // console.log(event);
                    myCalendar += event;
                }
                startIdx++;
            }
            myCalendar += "END:VCALENDAR";
            // console.log(myCalendar);

            
            const blob = new Blob([myCalendar], { type: "text/calendar;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }catch(error){
            alert(error);
        };
    }
    const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const SCOPES = "https://www.googleapis.com/auth/calendar";
    const [accessToken, setAccessToken] = useState(null);
    const [status, setStatus] = useState("Chưa kết nối");
    // Hàm kích hoạt đăng nhập OAuth2
    const handleConnect = () => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse) => {
            if (tokenResponse.access_token) {
              setAccessToken(tokenResponse.access_token);
              setStatus("Đã kết nối thành công!");
            }
          },
        });
        client.requestAccessToken();
    };
    const createNewCalendarAndEvent = async () => {
      if (!accessToken) return alert("Vui lòng kết nối Google trước!");
      setIsLoading(true);
      try {
        if(startDate > endDate) throw new Error("Ngày bắt đầu hoặc ngày kết thúc không hợp lệ");
        const splited = handleSplit();
        const lines = splited.lines;
        let startIdx = splited.startIdx;

        // Create new Calendar
        const createCalRes = await fetch("https://www.googleapis.com/calendar/v3/calendars", {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'summary': `UScheduled_${lines[startIdx - 4]}`, // Tên bộ lịch mới
            'timeZone': 'Asia/Ho_Chi_Minh'
          })
        });

        const newCalendar = await createCalRes.json();
        const newCalendarId = newCalendar.id; 
        // Create Events
        let check = true;
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        while(lines[startIdx] !== end_line && startIdx < lines.length - 1){
            const line = lines[startIdx].split('\t');

            let theory = line[9] !== "" ? line[9].split(" ") : [""];
            let experiment = line[10] !== "" ? line[10].split(" ") : [""];
            if(theory[0] !== ""){
                const st = new Date(startDate);
                while (st.getDay() !== convert[theory[0]]) { 
                    st.setDate(st.getDate() + 1);
                }
                const event = {
                    'summary': `${line[2]} (Lý thuyết)`,
                    'description': `Mã môn học: ${line[1]}\nSố tín chỉ: ${line[3]}\nPhòng: ${theory[2] ? theory[2].replace(/[()]/g, "") : "Chưa cập nhật"}\nGV: ${line[11]}\nGVTG: ${((line[13].length !== 0) ? (line[13]) : "")}`,
                    'start': {
                      'dateTime': `${`${st.toISOString().split("T")[0]}T${theory[1].split("-")[0]}:00+07:00`}`,
                      'timeZone': 'Asia/Ho_Chi_Minh'
                    },
                    'end': {
                      'dateTime': `${`${st.toISOString().split("T")[0]}T${theory[1].split("-")[1]}:00+07:00`}`,
                      'timeZone': 'Asia/Ho_Chi_Minh'
                    },
                    'recurrence': [
                        `RRULE:FREQ=WEEKLY;UNTIL=${endDate.replace(/-/g, "")}T165959Z;BYDAY=${mapping[theory[0]] || "MO"}`
                    ]
                  };

                // console.log(event);
                
                const addEventRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${newCalendarId}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
                });
                await delay(2000);
                if(check) check = addEventRes.ok;
                
            }

            if(experiment[0] !== ""){
                const st = new Date(startDate);
                while (st.getDay() !== convert[experiment[0]]) { 
                    st.setDate(st.getDate() + 1);
                }
                st.setDate(st.getDate() + 7);

                const event = {
                    'summary': `${line[2]} (Thực Hành)`,
                    'description': `Mã môn học: ${line[1]}\nSố tín chỉ: ${line[3]}\nPhòng: ${experiment[2] ? experiment[2].replace(/[()]/g, "") : "Chưa cập nhật"}\nGV: ${line[12]}\nGVTG: ${((line[13].length !== 0) ? (line[13]) : "")}`,
                    'start': {
                      'dateTime': `${`${st.toISOString().split("T")[0]}T${experiment[1].split("-")[0]}:00+07:00`}`,
                      'timeZone': 'Asia/Ho_Chi_Minh'
                    },
                    'end': {
                      'dateTime': `${`${st.toISOString().split("T")[0]}T${experiment[1].split("-")[1]}:00+07:00`}`,
                      'timeZone': 'Asia/Ho_Chi_Minh'
                    },
                    'recurrence': [
                        `RRULE:FREQ=WEEKLY;UNTIL=${endDate.replace(/-/g, "")}T165959Z;BYDAY=${mapping[experiment[0]] || "MO"}`
                    ]
                };
                // console.log(event);

                const addEventRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${newCalendarId}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
                });
                await delay(2000);
                if(check) check = addEventRes.ok;

                // console.log(event);
            }

            startIdx++;
        }
        
        if(check)
          alert("Đã thêm lịch");
        else 
          alert("Thêm lịch không thành công");
      } catch (error) {
        alert(error);
      } finally {
        setIsLoading(false);
      }
    };
    return (
        <>
        <div className="flex h-screen items-center justify-center bg-gray-100 gap-6">
            <div className="w-[400px] bg-white p-4 shadow-lg rounded-lg">
                <div className="flex flex-col gap-2">
                    <label className="font-bold">Chọn ngày bắt đầu học kỳ:</label>
                    <input 
                    type="date" 
                    className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bold">Chọn ngày kết thúc học kỳ:</label>
                    <input 
                    type="date" 
                    className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <label className="font-bold">
                    Thời khóa biểu của bạn:
                </label>
                
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)} 
                    className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ctrl+A và dán toàn bộ thời khóa biểu vào đây"
                ></textarea>
                
                <button 
                    className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition" 
                    onClick={createCalendarToFile}
                >
                    Tải xuống thời khóa biểu
                </button>
                <div className='p-[20px] items-center'>
                    <p>Trạng thái: <strong>{status}</strong></p>
                    
                    {!accessToken ? (
                        <button className="w-full px-[20px] py-[10px] text-[16px] cursor-pointer bg-[#4285F4] text-white border-none rounded-[5px] hover:bg-[#357ae8] transition-colors" onClick={handleConnect}>
                            Kết nối với Google
                        </button>
                    ) : (
                        <button 
                            className={`w-full px-[20px] py-[10px] text-[16px] ${isLoading ? "bg-gray-300 cursor-not-allowed" : "bg-[#28a745] cursor-pointer hover:bg-[#357ae8]"} text-white border-none rounded-[5px] transition-colors`}
                            onClick={createNewCalendarAndEvent}
                            disabled={isLoading}
                        >
                            {isLoading ? (<> Đang xử lý ... </>) : (<>Thêm vào <strong>Google Calendar</strong></>)}
                        </button>
                    )}
                </div>  
                <div className='text-[13px] text-gray-400'>
                    Nhấp {<a href="https://forms.gle/aKpYLxBNPGf6tryQ9" target="_blank" rel="noopener noreferrer" className='text-blue-400 hover:underline'>tại đây</a>} để gửi feedback cho mình nha, thank iu.
                </div>
            </div>
        </div>
        </>
    );
}
export default App;
