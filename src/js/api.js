import axios from 'axios';

export default {
    send: (options) => {
        axios.post(options.url.push, options.data, 
            { headers: { Authorization: "Bearer " + options.token, Accept: 'application/json' } }).
            then((response) => {
                const data = response.data;
                if (!data) {
                    options.error && options.error(data && data.msg);
                    return;
                }
                options.success && options.success(data);
            }).
            catch((e) => {
                console.error(e);
                options.error && options.error();
            });
    },

    read: (options) => {
        axios.get(options.url.pull).
            then((response) => {
                options.success && options.success(response.data);
            }).
            catch((e) => {
                console.error(e);
                options.error && options.error();
            });
    }
};
