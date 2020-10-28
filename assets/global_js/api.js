function api_get(end_point, data, cb) {

    if(typeof end_point !== "string" || end_point.length <= 0) 
        return console.error("you need to specify an endpoint");

    let parameters = "",
        param_arr  = [];

    if(typeof data === "function") 
    {
        cb = data;
    }

    if(typeof data === "object") 
    {
        $.each(data, (key, val) => {
            param_arr.push(`${key}=${val}`);
        });
        parameters += "?" + param_arr.join("&");
    }

    $.ajax({
        type: "GET",
        url: `/api_v1/${end_point}${parameters}`,
        timeout: 600000,
        success: function (data) {

            let req_data = data;

            if(isJson(req_data))
            {
                req_data = JSON.parse(req_data);
            }

            return cb(req_data);
        },
        error: function (e) {

            console.error("ERROR : ", e);
        }
    });

}

function api_post(end_point, data, cb) {

    if(typeof end_point !== "string" || end_point.length <= 0 || typeof data !== "object") 
        return console.error("you need to specify an endpoint");

    data['method'] = "_POST";

    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: `/api_v1/${end_point}`,
        processData: false,
        data : data,
        timeout: 600000,
        success: function (data) {

            let req_data = data;

            if(isJson(req_data))
            {
                req_data = JSON.parse(req_data);
            }

            return cb(req_data);
        },
        error: function (e) {

            console.error("ERROR : ", e);
        }
    });
}


function api_ajax(end_point, data, cb) {

    if(typeof end_point !== "string" || end_point.length <= 0 || typeof data !== "object") 
        return console.error("you need to specify an endpoint");

    if((data instanceof FormData) === false && (typeof data['method'] === "undefined" || typeof data['method'] !== "string"))
    {
        return console.error("Method needs to be specified in data");
    }

    $.ajax({
        type: "POST",
        enctype: 'multipart/form-data',
        url: `/api_v1/${end_point}`,
        data : data,
        processData: false,
        contentType: false,
        dataType : 'json',
        timeout: 600000,
        success: function (data) {

            let req_data = data;

            if(isJson(req_data))
            {
                req_data = JSON.parse(req_data);
            }

            return cb(req_data);
        },
        error: function (e) {

            console.error("ERROR : ", e);
        }
    });
} 