$( document ).ready(function() {
    
    $(".content").on('click', 'form.signupForm #submit', (e) => {
        e.preventDefault()

        let form_data = $(e.currentTarget).parents('form').serializeArray();

        let data = { "method": "signUp" };

        for (let i = 0, length = form_data.length; i < length; i++) {
            const elm = form_data[i];
            
            data[elm['name']] = elm['value'];
        }

        if(data['password'] !== data['confirmPassword'])
        {
            return alert("password dosn't match");
        }

        api_ajax("user")
        
        $.ajax({
            type: "POST",
            url: "/api_v1/user",
            data: data,
            success: (resp) => {
                console.log(resp);

                var resp = JSON.parse(resp);

                if(resp['success'] == false)
                {
                    alert("Signup failed " + resp['msg'])
                }
                else
                {
                    window.location.replace("./");
                }
            },
            error: () => {
                alert("signup failed")
            }
        });

    });
});