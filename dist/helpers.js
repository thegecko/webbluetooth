"use strict";
/*
* Node Web Bluetooth
* Copyright (c) 2017 Rob Moran
*
* The MIT License (MIT)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDescriptorUUID = exports.getCharacteristicUUID = exports.getServiceUUID = exports.getCanonicalUUID = exports.bluetoothDescriptors = exports.bluetoothCharacteristics = exports.bluetoothServices = void 0;
/**
 * Known services enum
 */
var bluetoothServices;
(function (bluetoothServices) {
    bluetoothServices[bluetoothServices["alert_notification"] = 6161] = "alert_notification";
    bluetoothServices[bluetoothServices["automation_io"] = 6165] = "automation_io";
    bluetoothServices[bluetoothServices["battery_service"] = 6159] = "battery_service";
    bluetoothServices[bluetoothServices["blood_pressure"] = 6160] = "blood_pressure";
    bluetoothServices[bluetoothServices["body_composition"] = 6171] = "body_composition";
    bluetoothServices[bluetoothServices["bond_management"] = 6174] = "bond_management";
    bluetoothServices[bluetoothServices["continuous_glucose_monitoring"] = 6175] = "continuous_glucose_monitoring";
    bluetoothServices[bluetoothServices["current_time"] = 6149] = "current_time";
    bluetoothServices[bluetoothServices["cycling_power"] = 6168] = "cycling_power";
    bluetoothServices[bluetoothServices["cycling_speed_and_cadence"] = 6166] = "cycling_speed_and_cadence";
    bluetoothServices[bluetoothServices["device_information"] = 6154] = "device_information";
    bluetoothServices[bluetoothServices["environmental_sensing"] = 6170] = "environmental_sensing";
    bluetoothServices[bluetoothServices["generic_access"] = 6144] = "generic_access";
    bluetoothServices[bluetoothServices["generic_attribute"] = 6145] = "generic_attribute";
    bluetoothServices[bluetoothServices["glucose"] = 6152] = "glucose";
    bluetoothServices[bluetoothServices["health_thermometer"] = 6153] = "health_thermometer";
    bluetoothServices[bluetoothServices["heart_rate"] = 6157] = "heart_rate";
    bluetoothServices[bluetoothServices["human_interface_device"] = 6162] = "human_interface_device";
    bluetoothServices[bluetoothServices["immediate_alert"] = 6146] = "immediate_alert";
    bluetoothServices[bluetoothServices["indoor_positioning"] = 6177] = "indoor_positioning";
    bluetoothServices[bluetoothServices["internet_protocol_support"] = 6176] = "internet_protocol_support";
    bluetoothServices[bluetoothServices["link_loss"] = 6147] = "link_loss";
    bluetoothServices[bluetoothServices["location_and_navigation"] = 6169] = "location_and_navigation";
    bluetoothServices[bluetoothServices["next_dst_change"] = 6151] = "next_dst_change";
    bluetoothServices[bluetoothServices["phone_alert_status"] = 6158] = "phone_alert_status";
    bluetoothServices[bluetoothServices["pulse_oximeter"] = 6178] = "pulse_oximeter";
    bluetoothServices[bluetoothServices["reference_time_update"] = 6150] = "reference_time_update";
    bluetoothServices[bluetoothServices["running_speed_and_cadence"] = 6164] = "running_speed_and_cadence";
    bluetoothServices[bluetoothServices["scan_parameters"] = 6163] = "scan_parameters";
    bluetoothServices[bluetoothServices["tx_power"] = 6148] = "tx_power";
    bluetoothServices[bluetoothServices["user_data"] = 6172] = "user_data";
    bluetoothServices[bluetoothServices["weight_scale"] = 6173] = "weight_scale";
})(bluetoothServices = exports.bluetoothServices || (exports.bluetoothServices = {}));
/**
 * Known characteristics enum
 */
var bluetoothCharacteristics;
(function (bluetoothCharacteristics) {
    bluetoothCharacteristics[bluetoothCharacteristics["aerobic_heart_rate_lower_limit"] = 10878] = "aerobic_heart_rate_lower_limit";
    bluetoothCharacteristics[bluetoothCharacteristics["aerobic_heart_rate_upper_limit"] = 10884] = "aerobic_heart_rate_upper_limit";
    bluetoothCharacteristics[bluetoothCharacteristics["aerobic_threshold"] = 10879] = "aerobic_threshold";
    bluetoothCharacteristics[bluetoothCharacteristics["age"] = 10880] = "age";
    bluetoothCharacteristics[bluetoothCharacteristics["aggregate"] = 10842] = "aggregate";
    bluetoothCharacteristics[bluetoothCharacteristics["alert_category_id"] = 10819] = "alert_category_id";
    bluetoothCharacteristics[bluetoothCharacteristics["alert_category_id_bit_mask"] = 10818] = "alert_category_id_bit_mask";
    bluetoothCharacteristics[bluetoothCharacteristics["alert_level"] = 10758] = "alert_level";
    bluetoothCharacteristics[bluetoothCharacteristics["alert_notification_control_point"] = 10820] = "alert_notification_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["alert_status"] = 10815] = "alert_status";
    bluetoothCharacteristics[bluetoothCharacteristics["altitude"] = 10931] = "altitude";
    bluetoothCharacteristics[bluetoothCharacteristics["anaerobic_heart_rate_lower_limit"] = 10881] = "anaerobic_heart_rate_lower_limit";
    bluetoothCharacteristics[bluetoothCharacteristics["anaerobic_heart_rate_upper_limit"] = 10882] = "anaerobic_heart_rate_upper_limit";
    bluetoothCharacteristics[bluetoothCharacteristics["anaerobic_threshold"] = 10883] = "anaerobic_threshold";
    bluetoothCharacteristics[bluetoothCharacteristics["analog"] = 10840] = "analog";
    bluetoothCharacteristics[bluetoothCharacteristics["apparent_wind_direction"] = 10867] = "apparent_wind_direction";
    bluetoothCharacteristics[bluetoothCharacteristics["apparent_wind_speed"] = 10866] = "apparent_wind_speed";
    bluetoothCharacteristics[bluetoothCharacteristics["gap.appearance"] = 10753] = "gap.appearance";
    bluetoothCharacteristics[bluetoothCharacteristics["barometric_pressure_trend"] = 10915] = "barometric_pressure_trend";
    bluetoothCharacteristics[bluetoothCharacteristics["battery_level"] = 10777] = "battery_level";
    bluetoothCharacteristics[bluetoothCharacteristics["blood_pressure_feature"] = 10825] = "blood_pressure_feature";
    bluetoothCharacteristics[bluetoothCharacteristics["blood_pressure_measurement"] = 10805] = "blood_pressure_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["body_composition_feature"] = 10907] = "body_composition_feature";
    bluetoothCharacteristics[bluetoothCharacteristics["body_composition_measurement"] = 10908] = "body_composition_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["body_sensor_location"] = 10808] = "body_sensor_location";
    bluetoothCharacteristics[bluetoothCharacteristics["bond_management_control_point"] = 10916] = "bond_management_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["bond_management_feature"] = 10917] = "bond_management_feature";
    bluetoothCharacteristics[bluetoothCharacteristics["boot_keyboard_input_report"] = 10786] = "boot_keyboard_input_report";
    bluetoothCharacteristics[bluetoothCharacteristics["boot_keyboard_output_report"] = 10802] = "boot_keyboard_output_report";
    bluetoothCharacteristics[bluetoothCharacteristics["boot_mouse_input_report"] = 10803] = "boot_mouse_input_report";
    bluetoothCharacteristics[bluetoothCharacteristics["gap.central_address_resolution_support"] = 10918] = "gap.central_address_resolution_support";
    bluetoothCharacteristics[bluetoothCharacteristics["cgm_feature"] = 10920] = "cgm_feature";
    bluetoothCharacteristics[bluetoothCharacteristics["cgm_measurement"] = 10919] = "cgm_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["cgm_session_run_time"] = 10923] = "cgm_session_run_time";
    bluetoothCharacteristics[bluetoothCharacteristics["cgm_session_start_time"] = 10922] = "cgm_session_start_time";
    bluetoothCharacteristics[bluetoothCharacteristics["cgm_specific_ops_control_point"] = 10924] = "cgm_specific_ops_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["cgm_status"] = 10921] = "cgm_status";
    bluetoothCharacteristics[bluetoothCharacteristics["csc_feature"] = 10844] = "csc_feature";
    bluetoothCharacteristics[bluetoothCharacteristics["csc_measurement"] = 10843] = "csc_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["current_time"] = 10795] = "current_time";
    bluetoothCharacteristics[bluetoothCharacteristics["cycling_power_control_point"] = 10854] = "cycling_power_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["cycling_power_feature"] = 10853] = "cycling_power_feature";
    bluetoothCharacteristics[bluetoothCharacteristics["cycling_power_measurement"] = 10851] = "cycling_power_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["cycling_power_vector"] = 10852] = "cycling_power_vector";
    bluetoothCharacteristics[bluetoothCharacteristics["database_change_increment"] = 10905] = "database_change_increment";
    bluetoothCharacteristics[bluetoothCharacteristics["date_of_birth"] = 10885] = "date_of_birth";
    bluetoothCharacteristics[bluetoothCharacteristics["date_of_threshold_assessment"] = 10886] = "date_of_threshold_assessment";
    bluetoothCharacteristics[bluetoothCharacteristics["date_time"] = 10760] = "date_time";
    bluetoothCharacteristics[bluetoothCharacteristics["day_date_time"] = 10762] = "day_date_time";
    bluetoothCharacteristics[bluetoothCharacteristics["day_of_week"] = 10761] = "day_of_week";
    bluetoothCharacteristics[bluetoothCharacteristics["descriptor_value_changed"] = 10877] = "descriptor_value_changed";
    bluetoothCharacteristics[bluetoothCharacteristics["gap.device_name"] = 10752] = "gap.device_name";
    bluetoothCharacteristics[bluetoothCharacteristics["dew_point"] = 10875] = "dew_point";
    bluetoothCharacteristics[bluetoothCharacteristics["digital"] = 10838] = "digital";
    bluetoothCharacteristics[bluetoothCharacteristics["dst_offset"] = 10765] = "dst_offset";
    bluetoothCharacteristics[bluetoothCharacteristics["elevation"] = 10860] = "elevation";
    bluetoothCharacteristics[bluetoothCharacteristics["email_address"] = 10887] = "email_address";
    bluetoothCharacteristics[bluetoothCharacteristics["exact_time_256"] = 10764] = "exact_time_256";
    bluetoothCharacteristics[bluetoothCharacteristics["fat_burn_heart_rate_lower_limit"] = 10888] = "fat_burn_heart_rate_lower_limit";
    bluetoothCharacteristics[bluetoothCharacteristics["fat_burn_heart_rate_upper_limit"] = 10889] = "fat_burn_heart_rate_upper_limit";
    bluetoothCharacteristics[bluetoothCharacteristics["firmware_revision_string"] = 10790] = "firmware_revision_string";
    bluetoothCharacteristics[bluetoothCharacteristics["first_name"] = 10890] = "first_name";
    bluetoothCharacteristics[bluetoothCharacteristics["five_zone_heart_rate_limits"] = 10891] = "five_zone_heart_rate_limits";
    bluetoothCharacteristics[bluetoothCharacteristics["floor_number"] = 10930] = "floor_number";
    bluetoothCharacteristics[bluetoothCharacteristics["gender"] = 10892] = "gender";
    bluetoothCharacteristics[bluetoothCharacteristics["glucose_feature"] = 10833] = "glucose_feature";
    bluetoothCharacteristics[bluetoothCharacteristics["glucose_measurement"] = 10776] = "glucose_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["glucose_measurement_context"] = 10804] = "glucose_measurement_context";
    bluetoothCharacteristics[bluetoothCharacteristics["gust_factor"] = 10868] = "gust_factor";
    bluetoothCharacteristics[bluetoothCharacteristics["hardware_revision_string"] = 10791] = "hardware_revision_string";
    bluetoothCharacteristics[bluetoothCharacteristics["heart_rate_control_point"] = 10809] = "heart_rate_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["heart_rate_max"] = 10893] = "heart_rate_max";
    bluetoothCharacteristics[bluetoothCharacteristics["heart_rate_measurement"] = 10807] = "heart_rate_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["heat_index"] = 10874] = "heat_index";
    bluetoothCharacteristics[bluetoothCharacteristics["height"] = 10894] = "height";
    bluetoothCharacteristics[bluetoothCharacteristics["hid_control_point"] = 10828] = "hid_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["hid_information"] = 10826] = "hid_information";
    bluetoothCharacteristics[bluetoothCharacteristics["hip_circumference"] = 10895] = "hip_circumference";
    bluetoothCharacteristics[bluetoothCharacteristics["humidity"] = 10863] = "humidity";
    bluetoothCharacteristics[bluetoothCharacteristics["ieee_11073-20601_regulatory_certification_data_list"] = 10794] = "ieee_11073-20601_regulatory_certification_data_list";
    bluetoothCharacteristics[bluetoothCharacteristics["indoor_positioning_configuration"] = 10925] = "indoor_positioning_configuration";
    bluetoothCharacteristics[bluetoothCharacteristics["intermediate_blood_pressure"] = 10806] = "intermediate_blood_pressure";
    bluetoothCharacteristics[bluetoothCharacteristics["intermediate_temperature"] = 10782] = "intermediate_temperature";
    bluetoothCharacteristics[bluetoothCharacteristics["irradiance"] = 10871] = "irradiance";
    bluetoothCharacteristics[bluetoothCharacteristics["language"] = 10914] = "language";
    bluetoothCharacteristics[bluetoothCharacteristics["last_name"] = 10896] = "last_name";
    bluetoothCharacteristics[bluetoothCharacteristics["latitude"] = 10926] = "latitude";
    bluetoothCharacteristics[bluetoothCharacteristics["ln_control_point"] = 10859] = "ln_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["ln_feature"] = 10858] = "ln_feature";
    bluetoothCharacteristics[bluetoothCharacteristics["local_east_coordinate.xml"] = 10929] = "local_east_coordinate.xml";
    bluetoothCharacteristics[bluetoothCharacteristics["local_north_coordinate"] = 10928] = "local_north_coordinate";
    bluetoothCharacteristics[bluetoothCharacteristics["local_time_information"] = 10767] = "local_time_information";
    bluetoothCharacteristics[bluetoothCharacteristics["location_and_speed"] = 10855] = "location_and_speed";
    bluetoothCharacteristics[bluetoothCharacteristics["location_name"] = 10933] = "location_name";
    bluetoothCharacteristics[bluetoothCharacteristics["longitude"] = 10927] = "longitude";
    bluetoothCharacteristics[bluetoothCharacteristics["magnetic_declination"] = 10796] = "magnetic_declination";
    bluetoothCharacteristics[bluetoothCharacteristics["magnetic_flux_density_2D"] = 10912] = "magnetic_flux_density_2D";
    bluetoothCharacteristics[bluetoothCharacteristics["magnetic_flux_density_3D"] = 10913] = "magnetic_flux_density_3D";
    bluetoothCharacteristics[bluetoothCharacteristics["manufacturer_name_string"] = 10793] = "manufacturer_name_string";
    bluetoothCharacteristics[bluetoothCharacteristics["maximum_recommended_heart_rate"] = 10897] = "maximum_recommended_heart_rate";
    bluetoothCharacteristics[bluetoothCharacteristics["measurement_interval"] = 10785] = "measurement_interval";
    bluetoothCharacteristics[bluetoothCharacteristics["model_number_string"] = 10788] = "model_number_string";
    bluetoothCharacteristics[bluetoothCharacteristics["navigation"] = 10856] = "navigation";
    bluetoothCharacteristics[bluetoothCharacteristics["new_alert"] = 10822] = "new_alert";
    bluetoothCharacteristics[bluetoothCharacteristics["gap.peripheral_preferred_connection_parameters"] = 10756] = "gap.peripheral_preferred_connection_parameters";
    bluetoothCharacteristics[bluetoothCharacteristics["gap.peripheral_privacy_flag"] = 10754] = "gap.peripheral_privacy_flag";
    bluetoothCharacteristics[bluetoothCharacteristics["plx_continuous_measurement"] = 10847] = "plx_continuous_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["plx_features"] = 10848] = "plx_features";
    bluetoothCharacteristics[bluetoothCharacteristics["plx_spot_check_measurement"] = 10846] = "plx_spot_check_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["pnp_id"] = 10832] = "pnp_id";
    bluetoothCharacteristics[bluetoothCharacteristics["pollen_concentration"] = 10869] = "pollen_concentration";
    bluetoothCharacteristics[bluetoothCharacteristics["position_quality"] = 10857] = "position_quality";
    bluetoothCharacteristics[bluetoothCharacteristics["pressure"] = 10861] = "pressure";
    bluetoothCharacteristics[bluetoothCharacteristics["protocol_mode"] = 10830] = "protocol_mode";
    bluetoothCharacteristics[bluetoothCharacteristics["rainfall"] = 10872] = "rainfall";
    bluetoothCharacteristics[bluetoothCharacteristics["gap.reconnection_address"] = 10755] = "gap.reconnection_address";
    bluetoothCharacteristics[bluetoothCharacteristics["record_access_control_point"] = 10834] = "record_access_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["reference_time_information"] = 10772] = "reference_time_information";
    bluetoothCharacteristics[bluetoothCharacteristics["report"] = 10829] = "report";
    bluetoothCharacteristics[bluetoothCharacteristics["report_map"] = 10827] = "report_map";
    bluetoothCharacteristics[bluetoothCharacteristics["resting_heart_rate"] = 10898] = "resting_heart_rate";
    bluetoothCharacteristics[bluetoothCharacteristics["ringer_control_point"] = 10816] = "ringer_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["ringer_setting"] = 10817] = "ringer_setting";
    bluetoothCharacteristics[bluetoothCharacteristics["rsc_feature"] = 10836] = "rsc_feature";
    bluetoothCharacteristics[bluetoothCharacteristics["rsc_measurement"] = 10835] = "rsc_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["sc_control_point"] = 10837] = "sc_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["scan_interval_window"] = 10831] = "scan_interval_window";
    bluetoothCharacteristics[bluetoothCharacteristics["scan_refresh"] = 10801] = "scan_refresh";
    bluetoothCharacteristics[bluetoothCharacteristics["sensor_location"] = 10845] = "sensor_location";
    bluetoothCharacteristics[bluetoothCharacteristics["serial_number_string"] = 10789] = "serial_number_string";
    bluetoothCharacteristics[bluetoothCharacteristics["gatt.service_changed"] = 10757] = "gatt.service_changed";
    bluetoothCharacteristics[bluetoothCharacteristics["software_revision_string"] = 10792] = "software_revision_string";
    bluetoothCharacteristics[bluetoothCharacteristics["sport_type_for_aerobic_and_anaerobic_thresholds"] = 10899] = "sport_type_for_aerobic_and_anaerobic_thresholds";
    bluetoothCharacteristics[bluetoothCharacteristics["supported_new_alert_category"] = 10823] = "supported_new_alert_category";
    bluetoothCharacteristics[bluetoothCharacteristics["supported_unread_alert_category"] = 10824] = "supported_unread_alert_category";
    bluetoothCharacteristics[bluetoothCharacteristics["system_id"] = 10787] = "system_id";
    bluetoothCharacteristics[bluetoothCharacteristics["temperature"] = 10862] = "temperature";
    bluetoothCharacteristics[bluetoothCharacteristics["temperature_measurement"] = 10780] = "temperature_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["temperature_type"] = 10781] = "temperature_type";
    bluetoothCharacteristics[bluetoothCharacteristics["three_zone_heart_rate_limits"] = 10900] = "three_zone_heart_rate_limits";
    bluetoothCharacteristics[bluetoothCharacteristics["time_accuracy"] = 10770] = "time_accuracy";
    bluetoothCharacteristics[bluetoothCharacteristics["time_source"] = 10771] = "time_source";
    bluetoothCharacteristics[bluetoothCharacteristics["time_update_control_point"] = 10774] = "time_update_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["time_update_state"] = 10775] = "time_update_state";
    bluetoothCharacteristics[bluetoothCharacteristics["time_with_dst"] = 10769] = "time_with_dst";
    bluetoothCharacteristics[bluetoothCharacteristics["time_zone"] = 10766] = "time_zone";
    bluetoothCharacteristics[bluetoothCharacteristics["true_wind_direction"] = 10865] = "true_wind_direction";
    bluetoothCharacteristics[bluetoothCharacteristics["true_wind_speed"] = 10864] = "true_wind_speed";
    bluetoothCharacteristics[bluetoothCharacteristics["two_zone_heart_rate_limit"] = 10901] = "two_zone_heart_rate_limit";
    bluetoothCharacteristics[bluetoothCharacteristics["tx_power_level"] = 10759] = "tx_power_level";
    bluetoothCharacteristics[bluetoothCharacteristics["uncertainty"] = 10932] = "uncertainty";
    bluetoothCharacteristics[bluetoothCharacteristics["unread_alert_status"] = 10821] = "unread_alert_status";
    bluetoothCharacteristics[bluetoothCharacteristics["user_control_point"] = 10911] = "user_control_point";
    bluetoothCharacteristics[bluetoothCharacteristics["user_index"] = 10906] = "user_index";
    bluetoothCharacteristics[bluetoothCharacteristics["uv_index"] = 10870] = "uv_index";
    bluetoothCharacteristics[bluetoothCharacteristics["vo2_max"] = 10902] = "vo2_max";
    bluetoothCharacteristics[bluetoothCharacteristics["waist_circumference"] = 10903] = "waist_circumference";
    bluetoothCharacteristics[bluetoothCharacteristics["weight"] = 10904] = "weight";
    bluetoothCharacteristics[bluetoothCharacteristics["weight_measurement"] = 10909] = "weight_measurement";
    bluetoothCharacteristics[bluetoothCharacteristics["weight_scale_feature"] = 10910] = "weight_scale_feature";
    bluetoothCharacteristics[bluetoothCharacteristics["wind_chill"] = 10873] = "wind_chill";
})(bluetoothCharacteristics = exports.bluetoothCharacteristics || (exports.bluetoothCharacteristics = {}));
/**
 * Known descriptors enum
 */
var bluetoothDescriptors;
(function (bluetoothDescriptors) {
    bluetoothDescriptors[bluetoothDescriptors["gatt.characteristic_extended_properties"] = 10496] = "gatt.characteristic_extended_properties";
    bluetoothDescriptors[bluetoothDescriptors["gatt.characteristic_user_description"] = 10497] = "gatt.characteristic_user_description";
    bluetoothDescriptors[bluetoothDescriptors["gatt.client_characteristic_configuration"] = 10498] = "gatt.client_characteristic_configuration";
    bluetoothDescriptors[bluetoothDescriptors["gatt.server_characteristic_configuration"] = 10499] = "gatt.server_characteristic_configuration";
    bluetoothDescriptors[bluetoothDescriptors["gatt.characteristic_presentation_format"] = 10500] = "gatt.characteristic_presentation_format";
    bluetoothDescriptors[bluetoothDescriptors["gatt.characteristic_aggregate_format"] = 10501] = "gatt.characteristic_aggregate_format";
    bluetoothDescriptors[bluetoothDescriptors["valid_range"] = 10502] = "valid_range";
    bluetoothDescriptors[bluetoothDescriptors["external_report_reference"] = 10503] = "external_report_reference";
    bluetoothDescriptors[bluetoothDescriptors["report_reference"] = 10504] = "report_reference";
    bluetoothDescriptors[bluetoothDescriptors["number_of_digitals"] = 10505] = "number_of_digitals";
    bluetoothDescriptors[bluetoothDescriptors["value_trigger_setting"] = 10506] = "value_trigger_setting";
    bluetoothDescriptors[bluetoothDescriptors["es_configuration"] = 10507] = "es_configuration";
    bluetoothDescriptors[bluetoothDescriptors["es_measurement"] = 10508] = "es_measurement";
    bluetoothDescriptors[bluetoothDescriptors["es_trigger_setting"] = 10509] = "es_trigger_setting";
    bluetoothDescriptors[bluetoothDescriptors["time_trigger_setting"] = 10510] = "time_trigger_setting";
})(bluetoothDescriptors = exports.bluetoothDescriptors || (exports.bluetoothDescriptors = {}));
/**
 * Gets a canonical UUID from a partial UUID in string or hex format
 * @param uuid The partial UUID
 * @returns canonical UUID
 */
var getCanonicalUUID = function (uuid) {
    if (typeof uuid === 'number')
        uuid = uuid.toString(16);
    uuid = uuid.toLowerCase();
    if (uuid.length <= 8)
        uuid = ('00000000' + uuid).slice(-8) + '-0000-1000-8000-00805f9b34fb';
    if (uuid.length === 32)
        uuid = uuid.match(/^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12})$/).splice(1).join('-');
    return uuid;
};
exports.getCanonicalUUID = getCanonicalUUID;
/**
 * Gets a canonical service UUID from a known service name or partial UUID in string or hex format
 * @param service The known service name
 * @returns canonical UUID
 */
var getServiceUUID = function (service) {
    // Check for string as enums also allow a reverse lookup which will match any numbers passed in
    if (typeof service === 'string' && bluetoothServices[service]) {
        service = bluetoothServices[service];
    }
    return exports.getCanonicalUUID(service);
};
exports.getServiceUUID = getServiceUUID;
/**
 * Gets a canonical characteristic UUID from a known characteristic name or partial UUID in string or hex format
 * @param characteristic The known characteristic name
 * @returns canonical UUID
 */
var getCharacteristicUUID = function (characteristic) {
    // Check for string as enums also allow a reverse lookup which will match any numbers passed in
    if (typeof characteristic === 'string' && bluetoothCharacteristics[characteristic]) {
        characteristic = bluetoothCharacteristics[characteristic];
    }
    return exports.getCanonicalUUID(characteristic);
};
exports.getCharacteristicUUID = getCharacteristicUUID;
/**
 * Gets a canonical descriptor UUID from a known descriptor name or partial UUID in string or hex format
 * @param descriptor The known descriptor name
 * @returns canonical UUID
 */
var getDescriptorUUID = function (descriptor) {
    // Check for string as enums also allow a reverse lookup which will match any numbers passed in
    if (typeof descriptor === 'string' && bluetoothDescriptors[descriptor]) {
        descriptor = bluetoothDescriptors[descriptor];
    }
    return exports.getCanonicalUUID(descriptor);
};
exports.getDescriptorUUID = getDescriptorUUID;
//# sourceMappingURL=helpers.js.map