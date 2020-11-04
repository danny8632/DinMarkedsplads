class CreateProduct {

    constructor() {

        this.container = $(`.container`);

        this.modal = $(`.modal.upload-images-modal`);

        this.images = [];

        this.images_html = [];

        this.is_bound = false;

        this.show_upload_warning = false;

        this.data = {};
    }


    init() {

        this.modal.find('.modal-footer .upload-images').toggleClass("disabled", true);

        this.data = new FormData();

        this.fetch_category(() => {
            this.bind_event_handlers();
        });
    }


    bind_event_handlers() {

        if(this.is_bound) return;

        this.container.on('click', '.form-wrapper .images-input-wrapper .upload-img', () => {
            this.modal.toggleClass("hidden", false);
        });

        this.container.on("change", "input, textarea", (e) => {

            let value = e.currentTarget.value;

            if(value != "")
            {
                $(e.currentTarget).toggleClass("invalid", false);
            }
        });

        this.container.on("click", ".footer .create-product", () => {
            this.create_product();
        })


        this.modal.on('change', ".modal-body .upload-wrapper input", (e) => {
            this.handle_modal_image_upload(e.currentTarget);
        });

        this.modal.on("click", ".modal-footer .close-upload", () => {
            this.modal.toggleClass("hidden", true);
        });

        this.modal.on("click", ".modal-footer .upload-images", () => {
            this.complete_upload_modal();
        });


        this.is_bound = true;
    }


    fetch_category(cb) {


        api_get("categories", (resp) => {

            let select = this.container.find(`.category-select`);

            if(typeof resp.success == "undefined" || resp.success === false || typeof resp.data == "undefined" || resp.data.length <= 0)
            {
                select.addClass("disable");
            }
            else
            {
                for (let i = 0, length = resp.data.length; i < length; i++) {
                    const category = resp.data[i];
                    
                    let option = document.createElement("option");
                    
                    option.value = category.id;
                    option.innerHTML = category.name;

                    select.append(option)
                }
            }

            if(typeof cb == "function") cb();
        })
    }


    handle_modal_image_upload(input) {

        let files = input.files;
        const ALLOWED_FILE_TYPES = ["gif", "png", "jpg", "jpeg", "bmp", "webp"];

        let image_wrapper = this.modal.find('.modal-body div.images');

        image_wrapper.html("");

        if(files.length === 0)
        {
            this.modal.find('.modal-body .warning-text').toggleClass("hidden", false);
            return;
        }

        for (let i = 0, length = files.length; i < length; i++) {
            const file = files[i];
            
            let types = file.type.split("/"),
                extension = typeof types[1] == "undefined" ? types[0] : types[1];

            if(ALLOWED_FILE_TYPES.indexOf(extension) === -1)
            {
                this.show_upload_warning = true;
                continue;
            }

            try {
                let reader = new FileReader();

                reader.onload = (readerEvent) => {
                    let image_html = document.createElement("div");

                    image_html.classList.add("image-wrapper");
                    image_html.innerHTML = `<img src="${readerEvent.target.result}" />`;
                    
                    this.images_html.push(image_html);

                    this.modal.find('.modal-footer .upload-images').removeClass("disabled");

                    image_wrapper.append(image_html);
                }
                reader.readAsDataURL(file);

                this.images.push(file);
            
            } catch (error) {
                this.show_upload_warning = true;
            }
        }

        this.modal.find('.modal-body .warning-text').toggleClass("hidden", !this.show_upload_warning);
    }


    complete_upload_modal() {

        this.modal.toggleClass("hidden", true);

        this.container.find('.images-input-wrapper .images-wrapper .images').html("");

        for (let i = 0, length = this.images_html.length; i < length; i++) {
            const elm = this.images_html[i];
            this.container.find('.images-input-wrapper .images-wrapper .images').append(elm)
        }

        this.container.find('.footer .create-product').toggleClass('disabled', this.images_html.length <= 0); 

    }


    validate_input_feilds() {

        let form = this.container.find('.form-wrapper');

        form.find('input, textarea, select').each((i, elm) => {

            let input = $(elm),
                val   = input.val();

            this.data.append(input.attr("name"), val);

            input.toggleClass("invalid", val === "" || val <= 0 || (input.hasClass("number") && !this.validate_number_input(val)))
                
        })

    }


    validate_number_input(value) {

        if(value === "" || value.length === 0) return false;

        return parseFloat(value).toString() === value.toString();
    }


    create_product() {

        this.validate_input_feilds();

        if(this.container.find('input.invalid, textare.invalid, select.invalid').length > 0) return false;

        if(this.images.length <= 0) return false;

        this.data.append("method", "_POST")

        for (let i = 0, length = this.images.length; i < length; i++) {
            const file = this.images[i];
            this.data.append("files[]", this.images[i]);
        }

        api_form("products/create", this.data, (resp) => {

            if(resp.success === false || typeof resp.data.id === "undefined")
            {
                alert("Der skete en fejl i upload...");
                return false;
            }

            window.location.href = `./product?id=${resp.data.id}`;

        })
    }
}



$( document ).ready(function() {

    if(window.File && window.FileList && window.FileReader)
    {
        let cp = new CreateProduct;
        cp.init();
    }
    else
    {
        alert("Din browser er desværre for gammel");
    }
});
