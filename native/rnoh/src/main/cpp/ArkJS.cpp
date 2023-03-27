#include "ArkJS.h"
#include "napi/native_api.h"
#include <string>

ArkJS::ArkJS(napi_env env) {
    this->env = env;
}

napi_env ArkJS::get_env() {
    return this->env;
}

napi_value ArkJS::get_double(double init_value) {
    napi_value result;
    napi_create_double(this->env, init_value, &result);
    return result;
}

napi_value ArkJS::get_undefined() {
    napi_value undefined;
    napi_get_undefined(this->env, &undefined);
    return undefined;
}

RNOHNapiObjectBuilder ArkJS::createObjectBuilder() {
    return RNOHNapiObjectBuilder(this->env, this);
}

napi_value ArkJS::get_reference_value(napi_ref ref) {
    napi_value result;
    auto status = napi_get_reference_value(this->env, ref, &result);
    this->maybe_throw_from_status(status, "Couldn't get a reference value");
    return result;
}

napi_ref ArkJS::create_reference_value(napi_value value) {
    napi_ref result;
    auto status = napi_create_reference(this->env, value, 1, &result);
    this->maybe_throw_from_status(status, "Couldn't create a reference");
    return result;
}

napi_value ArkJS::createArray() {
    napi_value result;
    napi_create_array(env, &result);
    return result;
}

napi_value ArkJS::createArray(std::vector<napi_value> values) {
    napi_value result;
    napi_create_array(env, &result);
    for (size_t i = 0; i < values.size(); i++) {
        napi_set_element(env, result, i, values[i]);
    }
    return result;
}

std::vector<napi_value> ArkJS::get_callback_args(napi_callback_info info, size_t args_count) {
    size_t argc = args_count;
    std::vector<napi_value> args(args_count, nullptr);
    napi_get_cb_info(env, info, &argc, args.data(), nullptr, nullptr);
    return args;
}

napi_value ArkJS::createString(std::string const &str) {
    napi_value result;
    auto status = napi_create_string_utf8(env, str.c_str(), str.length(), &result);
    this->maybe_throw_from_status(status, "Failed to create string");
    return result;
}

napi_value ArkJS::getObjectProperty(napi_value object, std::string const &key) {
    return getObjectProperty(object, createString(key));
}

napi_value ArkJS::getObjectProperty(napi_value object, napi_value key) {
    napi_value result;
    auto status = napi_get_property(env, object, key, &result);
    this->maybe_throw_from_status(status, "Failed to retrieve property from object");
    return result;
}

double ArkJS::getDouble(napi_value value) {
    double result;
    auto status = napi_get_value_double(env, value, &result);
    this->maybe_throw_from_status(status, "Failed to retrieve double value");
    return result;
}

napi_value ArkJS::getArrayElement(napi_value array, uint32_t index) {
    napi_value result;
    auto status = napi_get_element(env, array, index, &result);
    this->maybe_throw_from_status(status, "Failed to retrieve value at index");
    return result;
}

uint32_t ArkJS::getArrayLength(napi_value array) {
    uint32_t length;
    auto status = napi_get_array_length(env, array, &length);
    this->maybe_throw_from_status(status, "Failed to read array length");
    return length;
}

void ArkJS::maybe_throw_from_status(napi_status status, const char *message) {
    if (status != napi_ok) {
        std::string msg_str = message;
        std::string error_code_msg_str = ". Error code: ";
        std::string status_str = std::to_string(status);
        std::string full_msg = msg_str + error_code_msg_str + status_str;
        auto c_str = full_msg.c_str();
        this->throw_error(c_str);
    }
}

void ArkJS::throw_error(const char *message) {
    napi_throw_error(this->env, nullptr, message);
    // stops a code execution after throwing napi_error
    throw std::runtime_error(message);
}

RNOHNapiObjectBuilder::RNOHNapiObjectBuilder(napi_env env, ArkJS *arkJs) : m_env(env), m_arkJs(arkJs) {
    napi_value obj;
    napi_create_object(env, &obj);
    m_object = obj;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, napi_value value) {
    napi_set_named_property(m_env, m_object, name, value);
    return *this;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, int value) {
    napi_value n_value;
    napi_create_int32(m_env, static_cast<int32_t>(value), &n_value);
    napi_set_named_property(m_env, m_object, name, n_value);
    return *this;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, facebook::react::Float value) {
    napi_value n_value;
    napi_create_double(m_env, static_cast<double>(value), &n_value);
    napi_set_named_property(m_env, m_object, name, n_value);
    return *this;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, char const *value) {
    napi_value n_value;
    size_t strLength = strlen(value);
    napi_create_string_utf8(m_env, value, strLength, &n_value);
    napi_set_named_property(m_env, m_object, name, n_value);
    return *this;
}

RNOHNapiObjectBuilder& RNOHNapiObjectBuilder::addProperty(const char *name, facebook::react::SharedColor value) {
    auto colorComponents = colorComponentsFromColor(value);
    napi_value n_value;
    napi_create_array(m_env, &n_value);
    napi_set_element(m_env, n_value, 0, m_arkJs->get_double(colorComponents.red));
    napi_set_element(m_env, n_value, 1, m_arkJs->get_double(colorComponents.green));
    napi_set_element(m_env, n_value, 2, m_arkJs->get_double(colorComponents.blue));
    napi_set_element(m_env, n_value, 3, m_arkJs->get_double(colorComponents.alpha));
    napi_set_named_property(m_env, m_object, name, n_value);
    return *this;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, std::string value) {
    napi_value n_value;
    napi_create_string_utf8(m_env, value.c_str(), value.length(), &n_value);
    napi_set_named_property(m_env, m_object, name, n_value);
    return *this;
}

napi_value RNOHNapiObjectBuilder::build() {
    return m_object;
}
