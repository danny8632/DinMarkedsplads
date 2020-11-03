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

        this.data = {};

        this.categories = [];

        this.changed_data = {};
    }


    init(modal_data, categories) {

        this.data = modal_data;

        this.categories = categories;

        this.changed_data = {'id' : modal_data.id};

        this.render();

        this.bind_event_handlers();
    }


    bind_event_handlers() {

        if(this.is_bound) return;

        this.modal.on("keyup, change", "input, textarea, select", (e) => {

            let elm = $(e.currentTarget);
            this.changed_data[elm.attr("name")] = elm.val();

            if(elm.val().length > 0)
            {
                elm.toggleClass("invalid", false);
            }
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


        this.modal.on("click", ".modal-footer .close", () => {
            this.modal.toggleClass("hidden", true);
        })

        this.is_bound = true;
    }


    update_values() {

        this.changed_data['method'] = "_UPDATE";

        api_ajax("products/myproducts", this.changed_data, (resp) => {
            
            if(typeof resp.data == "undefined") return console.error("something went wrong in the api request", resp);

            window.myProducts.update_tr_data(resp.data);

            this.modal.toggleClass("hidden", true);

        })
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
        


        this.modal.toggleClass("hidden", false);
        
    }

}
