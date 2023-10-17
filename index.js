let timequantum = 0;
const manipulateArr= [];
const copyArr = [];

const ganttchrtArr = [];
const tatArr = [];
const wtArr  = [];



function gChartDisplay(arr) {
   let tdrow1 = ``, tdrow2 = ``;
   for (let x = 0; x < arr.length; x++) {
        tdrow1  += `<td>${arr[x][0]}</td>`;
        tdrow2  += `<td>${arr[x][1]}</td>`; 
   }

   document.getElementById("gant-table").innerHTML = `</tr>${tdrow1}<tr>${tdrow2}</tr>`;
}

function outputDisplay(arr, sts, result, tbl, stsAT, stsBT, frml,w, tot) {
    let output = `<table id="${tbl}"><tr><th>P</th><th>${stsAT}</th><th>${stsBT}</th><th>Total</th></tr>`;

   for (let x = 0; x < arr.length; x++) {
       output += `<tr>`;
       for (let z = 0; z < arr[0].length; z++) {
           output += `<td>${arr[x][z]}</td>`;
       }
       output += `</tr>`;
   }
   output += `</table>`;

   document.getElementById("table-solve").innerHTML += ` <div> <h4 id="${sts}">${frml}</h4> ${output} <p id="${result}">Average ${w}: ${tot} / ${arr.length} = ${(tot /arr.length).toFixed(2)}ms </p> </div>`;
}


function output(arr,result,tot){
    let output = `<table > <tr><th>CT</th> <th colspan = ${arr.length-1}></th></tr><tr> <td>0</td>`
    for (let x = 0; x < arr.length-1; x++) {
        output  += `<td>${arr[x][1]}</td>`;
       
    }
    output += `</tr></table>`;
    document.getElementById("table-solve").innerHTML = `<div id= "table-WO"> ${output} <p id="${result}"> Average WT: ${tot} / ${arr.length-1} = ${(tot/arr.length).toFixed(2)}ms</p> </div>`; 

}

function clr(){
    document.getElementById("AT").value = "";
    document.getElementById("BT").value = "";
    document.getElementById("TQ").value = "";
}

function clrOutput() {
    document.getElementById("label-gantt").innerHTML= "";
    document.getElementById("alrt").innerHTML= "Gantt chart and table will be shown here";
    document.getElementById("table-solve").innerHTML = '';
    document.getElementById("gant-table").innerHTML = '';
   [manipulateArr, copyArr, ganttchrtArr, tatArr, wtArr].forEach(arr => arr.length = 0);
}

function bubble(arr, bol) {
   for (let x = 0; x < arr.length; x++) {
       for (let z = 0; z < arr.length - 1; z++) {
           if ((arr[z][1] > arr[z + 1][1] && bol)  || (arr[z][0] > arr[z + 1][0] && !bol) ) {
               let temp = arr[z + 1];
               arr[z + 1] = arr[z];
               arr[z] = temp;
           }
       }
   }
}
 

function fillArray(bol, sze, AT, BT){
   for (let x = 0; x < sze; x++) {
       if(bol){
           manipulateArr.push([('p' + (x+1)), AT[x], BT[x]]);
           copyArr.push([('p' + (x+1)), AT[x], BT[x]]);
       }else{
           manipulateArr.push([('p' + (x+1)), BT[x]]);
           copyArr.push([('p' + (x+1)), BT[x]]);
       }
   }
}

function userInput() {
    clrOutput();  
    let AT = document.getElementById("AT").value.trim();
    let BT = document.getElementById("BT").value.trim();
    let TQ = parseFloat(document.getElementById("TQ").value);

    if (AT !== "" && BT !== "" && !isNaN(TQ) ) {
        let ATvalue = AT.split(/\s+/).map(Number);
        let BTvalue = BT.split(/\s+/).map(Number);

        if (ATvalue.length === BTvalue.length) {
            fillArray(true, ATvalue.length, ATvalue, BTvalue);
            timequantum = TQ;
            bubble(manipulateArr, true);

            withAT();
            document.getElementById("alrt").innerHTML = "";
            document.getElementById("label-gantt").innerHTML = "Gantt Chart";
        } else {
            alert('not equal');
            return;
        }

    } else if( BT !== "" && !isNaN(TQ)) {
        let BTvalue = BT.split(/\s+/).map(Number);
        fillArray(false, BTvalue.length, null, BTvalue);
        timequantum = TQ;
        withoAT();
        document.getElementById("alrt").innerHTML = "";
        document.getElementById("label-gantt").innerHTML = "Gantt Chart";  
    }else alert("NUMBER ONLY!\nPlease fill in the required field");
    clr();
}

function withAT() {
    let time = 0, TATtotal = 0, WTtotal = 0;

    while (manipulateArr.length > 0) {
     
         let procss = manipulateArr.shift();
         let next = manipulateArr.length > 0 ? manipulateArr[0][1] : null;

         if (procss[2] > timequantum) {
             ganttchrtArr[ganttchrtArr.length++] = [procss[0], time += timequantum]; 
             procss[2] -= timequantum;
             manipulateArr.push(procss);

             if(time < next){
                manipulateArr.unshift(procss);
             }

         } else if (procss[2] != 0) {
             ganttchrtArr[ganttchrtArr.length++] = [procss[0], time += procss[2]];
             procss[2] -= procss[2];
             
             if(time < next){
                ganttchrtArr[ganttchrtArr.length] = ["///", time += (next - time)]; 
             }
             //TAT
             tatArr.push([procss[0], time, procss[1], (time - procss[1])]); 
             TATtotal += time - procss[1];    
         }
     }

       //WT
       bubble(tatArr, false); 
       for(let x = 0; x < tatArr.length; x++ ){
           wtArr.push([tatArr[x][0], tatArr[x][3], copyArr[x][2], (tatArr[x][3] - copyArr[x][2])]);
           WTtotal += tatArr[x][3] - copyArr[x][2];
       }

         gChartDisplay(ganttchrtArr);
         outputDisplay(tatArr,"stat1", "ot1","tat-table", "CT", "AT", "TAT = CT - AT","TAT", TATtotal);
         outputDisplay(wtArr,"stat2", "ot2","wt-table", "TAT", "BT", "WT = TAT - BT","WT", WTtotal);

  }



   function withoAT() {
       let time = 0, totalCT= 0;
   
       while (manipulateArr.some(([_, bt]) => bt > 0)) {
           for (let i = 0; i < manipulateArr.length; i++) {
               if (manipulateArr[i][1] > 0) {
                   const exe = Math.min(manipulateArr[i][1], timequantum);
                   ganttchrtArr.push([manipulateArr[i][0], time += exe]);
                   manipulateArr[i][1] -= exe;
                   
               }
           }
       }

       for (let i = 0; i < ganttchrtArr.length - 1; i++) {
           totalCT +=  ganttchrtArr[i][1];
       }

        gChartDisplay(ganttchrtArr);
        output(ganttchrtArr,"ot1", totalCT);
   }


  
   click = true;
   function transform(){
     if(click){
        socialLinks.classList.add("transformed");
        click = false
     }else{
        socialLinks.classList.remove("transformed");
        click = true;
     }
     
   }
