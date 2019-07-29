import Observer from './Observer'
import Emitter from './Emitter'

export default {

    install(Vue, connection_signal, options_signal,connection_record,options_record) {

        if (!connection_signal) throw new Error("[Vue-Mqtt] cannot locate connection_signal");
        if (!connection_record) throw new Error("[Vue-Mqtt] cannot locate connection_record");

        let observer_signal = new Observer(connection_signal, options_signal);
        let observer_record = new Observer(connection_record, options_record);

        Vue.prototype.$mqtt_signal = observer_signal.Mqtt;
        Vue.prototype.$mqtt_record = observer_record.Mqtt;

        Vue.mixin({
            created() {
                let mqtt_signal = this.$options['mqtt_signal'];
                this.$options.mqtt_signal = new Proxy({}, {
                    set: (target, key, value) => {
                        Emitter.addListener(key, value, this);
                        target[key] = value;
                        return true;
                    },
                    deleteProperty: (target, key) => {
                        Emitter.removeListener(key, this.$options.mqtt_signal[key], this);
                        delete target.key;
                        return true;
                    }
                });
                if (mqtt_signal) {
                    Object.keys(mqtt_signal).forEach((key) => {
                        this.$options.mqtt_signal[key] = mqtt_signal[key];
                    });
                }


                let mqtt_record = this.$options['mqtt_record'];
                this.$options.mqtt_record = new Proxy({}, {
                    set: (target, key, value) => {
                        Emitter.addListener(key, value, this);
                        target[key] = value;
                        return true;
                    },
                    deleteProperty: (target, key) => {
                        Emitter.removeListener(key, this.$options.mqtt_record[key], this);
                        delete target.key;
                        return true;
                    }
                });
                if (mqtt_record) {
                    Object.keys(mqtt_record).forEach((key) => {
                        this.$options.mqtt_record[key] = mqtt_record[key];
                    });
                } 
            },
            beforeDestroy() {
                let mqtt_signal = this.$options['mqtt_signal'];
                if (mqtt_signal) {
                    Object.keys(mqtt_signal).forEach((key) => {
                        delete this.$options.mqtt_signal[key];
                    });
                }

                
                let mqtt_record = this.$options['mqtt_record'];
                if (mqtt_record) {
                    Object.keys(mqtt_record).forEach((key) => {
                        delete this.$options.mqtt_record[key];
                    });
                }                
            }
        })

    }

}
