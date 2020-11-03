class EditProduct {

    static display_edit(modal_data, categories) {

        if(typeof window.EditModal == "undefined")
        {
            window.EditModal = new EditProduct;
        }
    
        window.EditModal.init(modal_data, categories);
    }

    constructor() {

        this.modal = $(`#edit-modal`);

        this.image_wrapper = this.modal.find("div.images-input-wrapper.input-wrapper .images-wrapper");

        this.data = {};

        this.categories = [];

        this.changed_data = {};

        this.files_to_upload = [];

        this.files_to_upload_counter = 1000;
    }


    init(modal_data, categories) {

        this.files_to_upload_counter = 1000;

        this.data = modal_data;

        this.categories = categories;

        this.files_to_upload = [];

        this.changed_data = {'id' : modal_data.id};

        this.render();

        this.bind_event_handlers();
    }


    bind_event_handlers() {

        if(this.is_bound) return;

        this.modal.on("keyup, change", `input[name!="images"], textarea, select`, (e) => {

            let elm = $(e.currentTarget);
            this.changed_data[elm.attr("name")] = elm.val();

            if(elm.val().length > 0)
            {
                elm.toggleClass("invalid", false);
            }
        })

        this.modal.on("change", `input[name="images"]`, (e) => {
            this.handle_modal_image_upload(e.currentTarget)
        })


        this.modal.on('click', ".modal-footer .save-product", () => {
            this.modal.toggleClass("hidden", this.changed_data.length === 0);

            let empty_field = false;

            $.each(this.changed_data, (key, val) => {
                if(val.length === 0)
                {
                    this.modal.find(`input[name="${key}"], textarea[name="${key}"], select[name="${key}"]`).toggleClass("invalid", true);
                    empty_field = true;
                    return false;
                }
            });

            if(empty_field) return;

            this.update_values();

        });


        this.modal.on("click", ".delete-image-btn", (e) => {
            let id = e.currentTarget.parentNode.dataset.id;
            this.delete_asset(Number(id));
        });


        this.modal.on("click", ".modal-footer .close", () => {
            this.modal.toggleClass("hidden", true);
        })

        this.is_bound = true;
    }


    delete_asset(id) {

        id = Number(id);

        console.log(id)

        if(id >= 1000)
        {
            this.files_to_upload.splice((id-1001), 1);
        }
        else
        {
            if(typeof this.changed_data['delete_assets'] == "undefined") this.changed_data['delete_assets'] = [];
    
            let index = this.data.assets.findIndex(x => x.id == id);
            
            this.changed_data['delete_assets'].push(id);
            this.data.assets.splice(index, 1);
        }
        
        this.image_wrapper.find(`.image-wrapper[data-id="${id}"]`).remove();

    }


    update_values() {

        let form = new FormData();

        $.each(this.changed_data, (i,v) => form.append(i,v));

        for (let i = 0, length = this.files_to_upload.length; i < length; i++) {
            form.append("files[]", this.files_to_upload[i]);
        }

        form.append('method', "_UPDATE");

        api_form("products/myproducts", form, (resp) => {
            
            if(typeof resp.data == "undefined") return console.error("something went wrong in the api request", resp);

            window.myProducts.update_tr_data(resp.data);

            this.modal.toggleClass("hidden", true);
        })
    }


    add_images(img, id) {

        let image_html = document.createElement("div");

        image_html.classList.add("image-wrapper");

        if(typeof id != "undefined") image_html.dataset.id = id;
        
        image_html.innerHTML = `<div class="delete-image-btn"><i class="fas fa-trash"></i></div><img src="${img}" />`;

        this.image_wrapper.append(image_html);

        if(id >= 1000) this.files_to_upload_counter += 1;
    }


    render() {

        this.modal.find("input, textarea").each((i, elm) => {
            $(elm).val(this.data[$(elm).attr("name")]);
        })

        
        //  Fill categories dropdown
        //  Selecting the current one
        let select = this.modal.find(`.category-select`);

        if(this.categories.length == 0)
        {
            select.addClass("disable");
        }
        else
        {
            for (let i = 0, length = this.categories.length; i < length; i++) {
                const category = this.categories[i];
                
                let option = document.createElement("option");
                
                option.value = category.id;
                option.innerHTML = category.name;

                select.append(option)
            }

            select.val(this.data.categories[0]);
        }

        //  Import pictures
        this.image_wrapper.html("");



        for (let i = 0, length = this.data.assets.length; i < length; i++) {
            const img = this.data.assets[i];
            
            this.add_images(img.location, img.id);
        }

        this.modal.toggleClass("hidden", false);
        
    }


    handle_modal_image_upload(input) {

        let files = input.files;
        let show_warning = false;
        const ALLOWED_FILE_TYPES = ["gif", "png", "jpg", "jpeg", "bmp", "webp"];

        if(files.length > 0)
        {
            for (let i = 0, length = files.length; i < length; i++) {
                const file = files[i];
                
                let types     = file.type.split("/"),
                    extension = typeof types[1] == "undefined" ? types[0] : types[1];
    
                if(ALLOWED_FILE_TYPES.indexOf(extension) === -1) { show_warning= true; continue; }
    
                try {
                    let reader = new FileReader();
    
                    reader.onload = (readerEvent) => this.add_images(readerEvent.target.result, this.files_to_upload_counter);
                    reader.readAsDataURL(file);
                    
                    this.files_to_upload.push(file);
                
                } catch(e) {
                    show_warning = true;
                }
            }
        }
        else
        {
            show_warning = true;
        }

        input.value = "";

        //  TODO: Show warning
    }

}
