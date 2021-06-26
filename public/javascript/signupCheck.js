    $("#signupUsername").on("change", checkUserAvailability);
    $("#signupEmail").on("change", checkEmailAvailability);
    $("#signupPassword").on("change", checkPasswordLength);
    $("#signupPasswordConfirm").on("change", checkPasswordMatch);

    async function checkUserAvailability() {
      $("#userMsg").empty();
      console.log("signup: checkAvailability: ");
      let tempName = $("#signupUsername").val();
      console.log("tempName: ", tempName);

      if((tempName.length >= 6) && (tempName.length <= 40)) {
        let url = `/api/user-availability?name=${tempName}`;
        // console.log("url: ", url);
        let response = await fetch(url);
        // console.log("response: ", response);
        let data = await response.json();
        console.log("available: ", data);
        console.log(typeof(data));

        if(data == true) {
          $("#userMsg").text("Username available");
          $("#userMsg").css("color", "green");
        } else {
          $("#userMsg").text("Username unavailable");
          $("#userMsg").css("color", "red");
        }
      } else {
        $("#userMsg").text("Username must be 6-40 characters");
        $("#userMsg").css("color", "red");
      }
    }

    async function checkEmailAvailability() {
      $("#emailMsg").empty()
      // console.log("signup: checkEmailAvailability: ");
      let tempEmail = $("#signupEmail").val()
      // console.log("signup: checkEmailAvailability: tempEmail: ", tempEmail);

      // type="email" auto checks for valid email
      let url = `/api/email-availability?email=${tempEmail}`;
      // console.log("signup: checkEmailAvailability: url: ", url);
      let response = await fetch(url);
      let data = await response.json();

      if(data != true) {
        $("#emailMsg").text("email unavailable");
        $("#emailMsg").css("color", "red");
      }
    }

    function checkPasswordLength() {
      $("#passwordMsg1").empty();
      if (($("#signupPassword").val().length < 6) || ($("#signupPassword").val().length > 40)) {
        $("#passwordMsg1").text("Password must be 6-40 characters.");
        $("#passwordMsg1").css("color", "red");
      }
    }

    async function checkPasswordMatch() {
      $("#passwordMsg2").empty();
      if ( $("#signupPassword").val() != $("#signupPasswordConfirm").val()) {
        $("#passwordMsg2").text("Passwords do not match.");
        $("#passwordMsg2").css("color", "red");
      }
    }