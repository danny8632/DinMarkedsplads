$( document ).ready(function() {
    
    $(".content").on('click', 'form.signupForm #submit', (e) => {
        e.preventDefault()

        let form_data = $(e.currentTarget).parents('form').serializeArray();

        let data = { "method": "signUp" };

        for (let i = 0, length = form_data.length; i < length; i++) {
            const elm = form_data[i];
            
            data[elm['name']] = elm['value'];
        }

        $(".content").find(".error-text").remove();

        if(data['password'] !== data['confirmPassword'])
        {
            $(`<p class="error-text">Adgangskode og gentag adgangskode er ikke ens.</p>`).insertAfter(".content .title-wrapper");
            return;
        }
        else if(data['email'].length < 6 || data['username'].length < 6 || data['password'] < 6)
        {
            $(`<p class="error-text">Email, Brugernavn og password kræver minimum 6 karakter.</p>`).insertAfter(".content .title-wrapper");
            return;
        }


        api_ajax("user", data, (resp) => {

            $(".content").find(".error-text").remove();

            if(resp.success === false)
            {
                $(`<p class="error-text">${resp.data.msg}</p>`).insertAfter(".content .title-wrapper");
                return;
            }
            else
            {
                $(".content").find('.form-wrapper').toggleClass("hidden", true);
                $(".content").find('.confirm-email').toggleClass("hidden", false);
            }

        });
    });
});