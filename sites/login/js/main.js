$( document ).ready(function() {

    $(".content").on('click', '.btn.signupButton', () => {
        window.location.href = './signup';
    })

    $(".content").on('click', 'form.loginForm #submit', (e) => {
        e.preventDefault();

        let form_data = $(e.currentTarget).parents('form.loginForm').serializeArray(),
            data      = { "method": "login" };

        for (let i = 0, length = form_data.length; i < length; i++) {
            const elm = form_data[i];
            
            data[elm['name']] = elm['value'];
        }

        $(".content").find(".error-text").remove();

        api_ajax("user", data, (resp) => {

            if(typeof resp.success == "undefined" || resp.success === false)
            {
                $(`<p class="error-text">${resp.data.msg}</p>`).insertAfter(".content .title-wrapper");
                return;
            }
            else
            {
                window.location.href = "./";
            }
        });

    })
});