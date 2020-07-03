
    //Captcha Code
    //--------------------------------------------------------------------------------------------------------------------------
    var code;
    function createCaptcha() {
      //clear the contents of captcha div first 
      document.getElementById('captcha').innerHTML = "";
      var charsArray =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%^&*";
      var lengthOtp = 200;
      var captcha = [];
      for (var i = 0; i < lengthOtp; i++) {
        //below code will not allow Repetition of Characters
        var index = Math.floor(Math.random() * charsArray.length + 1); //get the next character from the array
        if (captcha.indexOf(charsArray[index]) == -1)
          captcha.push(charsArray[index]);
        else i--;
      }
      var canv = document.createElement("canvas");
      canv.id = "captcha";
      canv.width = 3000;
      canv.height = 50;
      var ctx = canv.getContext("2d");
      ctx.font = "25px Georgia";
      ctx.strokeText(captcha.join(""), 0, 30);
      //storing captcha so that can validate you can save it somewhere else according to your specific requirements
      code = captcha.join("");
      document.getElementById("captcha").appendChild(canv); // adds the canvas to the body element
    }

    function validateCaptcha() {
      event.preventDefault();
      
      getFeatures();
      if (document.getElementById("cpatchaTextBox").value == code) {
        
        alert("Valid Captcha");
      }else{
        alert("Invalid Captcha. try Again");
        createCaptcha();
      }
    }
    function getFeatures(){
      var obj = {};
      obj.arr = history.get();
      obj.seekArr = history.get_seek();
      obj.pressArr = history.get_press();
      var histSkt = fo(obj.seekArr);
      var histPrt = fo(obj.pressArr);
      var hist_prt_len = histSkt.length;
      var hist_skt_len = histPrt.length;
      var pressHistMean = round(avg(histPrt));
      var seekHistMean = round(avg(histSkt));
      var pressHistSd = round(standard_dev(histPrt));
      var seekHistSd = round(standard_dev(histSkt));
      var charMeanTime = seekHistMean + pressHistMean;
      var pressRatio = round((pressHistMean+z)/(charMeanTime+z),4);
      var seekToPressRatio = round((1-pressRatio)/pressRatio,4);
      var pressSdToPressRatio = round((pressHistSd+z)/(pressHistMean+z),4);
      var seekSdToPressRatio = round(((seekHistSd+z)/(pressHistMean+z)),4);
      for(var i in obj.arr) {
        var rev = obj.arr[i][1].length;
        var seekMean = 0;
        var pressMean = 0;
        var postMean = 0;
        var seekSd = 0;
        var pressSd = 0;
        var postSd = 0;
        var arr = fo(obj.arr[i][0]);
        seekMean = round((avg(arr)+z)/(seekHistMean+z),4);
        seekSd = round((standard_dev(arr)+z)/(seekHistSd+z),4);
        arr = fo(obj.arr[i][1]);
        seekMean = round((avg(arr)+z)/(pressHistMean+z),4);
        seekSd = round((standard_dev(arr)+z)/(pressHistSd+z),4);
        arr = fo(obj.arr[i][2]);
        postMean = round((avg(arr)+z)/(seekHistMean+z),4);
        postSd = round((standard_dev(arr)+z)/(seekHistSd+z),4);
        delete obj.arr[i][0];
        delete obj.arr[i][1];
        delete obj.arr[i][2];
        obj.arr[i][0] = rev;
        obj.arr[i][1] = seekMean;
        obj.arr[i][2] = pressMean;
        obj.arr[i][3] = postMean;
        obj.arr[i][4] = seekSd;
        obj.arr[i][5] = pressSd;
        obj.arr[i][6] = postSd;
      }
    }
    //--------------------------------------------------------------------------------------------------------------


    //initializing required variables

    //to get time time at which the page is loaded
    var pt1 = (new Date).getTime();

    //will store the current in function key that is being pressed
    var wfk = [];

    //will store seek time of the keys
    var skt = [];

    //will store start time of the keys
    var sti = []; 

    var t0 = pt1;

    //initializing previous key code as zero meaninig no key has been pressed
    var prevKeyCode = 0;

    var z = 0.0000001;

    keyCodes = [65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,32,222,188,190,186,187,189,191,48,49,50,51,52,53,54,55,56,57];
    keyCodesObj = {65:1,66:1,67:1,68:1,69:1,70:1,71:1,72:1,73:1,74:1,75:1,76:1,77:1,78:1,79:1,80:1,81:1,82:1,83:1,84:1,85:1,86:1,87:1,88:1,89:1,90:1,32:1,222:1,188:1,190:1,186:1,187:1,189:1,191:1,48:1,49:1,50:1,51:1,52:1,53:1,54:1,55:1,56:1,57:1}
      

    //keydown function
    $('#cpatchaTextBox').keydown(e=>{
            if(!e.shiftKey){
              pt1 = (new Date).getTime();
              var keycode = e.keyCode;
              console.log("yes : " + e.keyCode);
              var seekTotal = pt1-t0;
              var startTime = pt1;
              skt[keycode] = seekTotal;
              sti[keycode] = startTime;
              wfk[keycode] = 1;
            }
        });


    //keyup function
    var arr;
    $('#cpatchaTextBox').keyup(e=>{
      var ut = (new Date).getTime();
      if(!e.shiftKey){
        var keycode = e.keyCode;
        if(wfk[keycode] === 1){
          var pressTime = ut - sti[keycode];
          var seekTime = skt[keycode];
          arr = [keycode, seekTime, pressTime, prevKeyCode, ut];
          console.log(arr);
          history.add(arr);
          prevKeyCode = e.keyCode;           
        }  
      }
      wfk[keycode] = 0;
    });

  // to store keystroke data collected above in usable form
    
   
    //console.log(obj);
    history = {};
    history.stack = [];
    
     

    history.get = function(){
      var histStackObject = {};
      for(var i in keyCodes){
        histStackObject[keyCodes[i]] = [[], [], []];  
      }
      for(var i in this.stack){
        var arr = this.stack[i];
          if(keyCodesObj[arr[0]]){
          var keyCode = arr[0];
          var seekTime = arr[1];
          var pressTime = arr[2];
          var prevKeyCode = arr[3];
          histStackObject[keyCode][0].push(seekTime);
          if(prevKeyCode != 0 && keyCodesObj[prevKeyCode]){
            histStackObject[prevKeyCode][2].push(seekTime);
          }
          histStackObject[keyCode][1].push(pressTime); 
        }  
      }
      return histStackObject;
    }

    history.add = function(arr) {
      this.stack.push(arr);
      this.get();
    }
    history.get_seek = function(){
      var seekArr = [];
      for(i in this.stack){
        seekArr.push(this.stack[i][1]);
      }
      return seekArr;
    }
    history.get_press = function(){
      var pressArr = [];
      for(i in this.stack){
        pressArr.push(this.stack[i][2]);
      }
      return pressArr; 
    }

    var fo = function(arr){
      var values = arr.concat();
      var len = arr.length;
      values.sort(function(a, b){
        return a - b;
      });
      var sd = standard_dev(values);
      var median = values[Math.ceil(arr.length/2)];
      var multiplier = 2;
      var maxVal = median + multiplier*sd;
      var minVal = median - multiplier*sd;
      if(len<20){
        minVal = 0;
      }
      var final_values = [];
      for(var i=0;i<len;i++){
        tempval = values[i];
        if(tempval < maxVal && tempval > minVal){
          final_values.push(tempval);
        }
      }
      return final_values;
    }

     var avg = function(arr){
      var len = arr.length;
      var sum = 0;
      for(var i=0;i<len;i++){
        sum += arr[i];
      }
      return round(sum/len,4);
    }

    var round = function(val, dec){
      return Number(val.toFixed(dec));
    }

    var standard_dev = function(arr){
      var len = arr.length;
      if(len<2){
        return 0;
      }else{
        var sum_variance = 0;
        var mean = avg(arr);
        for(var i=0;i<len;i++){
          sum_variance += (arr[i]-mean)*(arr[i]-mean);
        }
        var sd = Math.sqrt(sum_variance/len);
        return sd;
      }
    }