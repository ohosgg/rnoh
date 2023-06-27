#include "ArkJS.h"
#include "napi/native_api.h"
#include <string>

ArkJS::ArkJS(napi_env env) {
    m_env = env;
}

napi_env ArkJS::getEnv() {
    return m_env;
}

napi_value ArkJS::call(napi_value callback, std::vector<napi_value> args, napi_value thisObject) {
    napi_value result;
    auto status = napi_call_function(m_env, thisObject, callback, args.size(), args.data(), &result);
    this->maybeThrowFromStatus(status, "Couldn't call a callback");
    return result;
}

napi_value ArkJS::call(napi_value callback, const napi_value *args, int argsCount, napi_value thisObject) {
    napi_value result;
    auto status = napi_call_function(m_env, thisObject, callback, argsCount, args, &result);
    this->maybeThrowFromStatus(status, "Couldn't call a callback");
    return result;
}

napi_value ArkJS::createBoolean(bool value) {
    napi_value result;
    napi_get_boolean(m_env, value, &result);
    return result;
}

napi_value ArkJS::createInt(int value) {
    napi_value result;
    napi_create_int32(m_env, static_cast<int32_t>(value), &result);
    return result;
}

napi_value ArkJS::createDouble(double value) {
    napi_value result;
    napi_create_double(m_env, value, &result);
    return result;
}

napi_value ArkJS::createString(std::string const &str) {
    napi_value result;
    auto status = napi_create_string_utf8(m_env, str.c_str(), str.length(), &result);
    this->maybeThrowFromStatus(status, "Failed to create string");
    return result;
}

napi_value ArkJS::getUndefined() {
    napi_value result;
    napi_get_undefined(m_env, &result);
    return result;
}

napi_value ArkJS::getNull() {
    napi_value result;
    napi_get_null(m_env, &result);
    return result;
}

RNOHNapiObjectBuilder ArkJS::createObjectBuilder() {
    return RNOHNapiObjectBuilder(m_env, *this);
}

std::vector<napi_value> ArkJS::createFromDynamics(std::vector<folly::dynamic> dynamics) {
    std::vector<napi_value> results(dynamics.size());
    for (size_t i = 0; i < dynamics.size(); ++i) {
        results[i] = this->createFromDynamic(dynamics[i]);
    }
    return results;
}

napi_value ArkJS::createFromDynamic(folly::dynamic dyn) {
    if (dyn.isBool()) {
        return this->createBoolean(dyn.asBool());
    } else if (dyn.isInt()) {
        return this->createDouble(dyn.asInt());
    } else if (dyn.isDouble()) {
        return this->createDouble(dyn.asDouble());
    } else if (dyn.isString()) {
        return this->createString(dyn.asString());
    } else if (dyn.isArray()) {
        std::vector<napi_value> n_values(dyn.size());
        for (size_t i = 0; i < dyn.size(); ++i) {
            n_values[i] = this->createFromDynamic(dyn[i]);
        }
        return this->createArray(n_values);
    } else if (dyn.isObject()) {
        auto objectBuilder = this->createObjectBuilder();
        for (const auto &pair : dyn.items()) {
            objectBuilder.addProperty(pair.first.asString().c_str(), this->createFromDynamic(pair.second));
        }
        return objectBuilder.build();
    } else {
        return this->getUndefined();
    }
}

napi_value ArkJS::getReferenceValue(napi_ref ref) {
    napi_value result;
    auto status = napi_get_reference_value(m_env, ref, &result);
    this->maybeThrowFromStatus(status, "Couldn't get a reference value");
    return result;
}

napi_ref ArkJS::createReference(napi_value value) {
    napi_ref result;
    auto status = napi_create_reference(m_env, value, 1, &result);
    this->maybeThrowFromStatus(status, "Couldn't create a reference");
    return result;
}

std::function<napi_value(napi_env, std::vector<napi_value>)> *createNapiCallback(std::function<void(std::vector<folly::dynamic>)> &&callback) {
    return new std::function([callback = std::move(callback)](napi_env env, std::vector<napi_value> callbackNapiArgs) -> napi_value {
        ArkJS arkJs(env);
        callback(arkJs.getDynamics(callbackNapiArgs));
        return arkJs.getUndefined();
    });
}

napi_value singleUseCallback(napi_env env, napi_callback_info info) {
    void *data;
    napi_get_cb_info(env, info, nullptr, nullptr, nullptr, &data);
    auto callback = static_cast<std::function<napi_value(napi_env, std::vector<napi_value>)> *>(data);
    ArkJS arkJs(env);
    (*callback)(env, arkJs.getCallbackArgs(info));
    delete callback;
    return arkJs.getUndefined();
}

/*
 * The callback will be deallocated after is called. It cannot be called more than once. Creates memory leaks if the callback is not called.
 * Consider changing this implementation when adding napi finalizers is supported. .
 */
napi_value ArkJS::createSingleUseCallback(std::function<void(std::vector<folly::dynamic>)> &&callback) {
    std::string fnName = "callback";
    napi_value result;
    auto status = napi_create_function(m_env, fnName.c_str(), fnName.length(), singleUseCallback, createNapiCallback(std::move(callback)), &result);
    this->maybeThrowFromStatus(status, "Couldn't create a callback");
    return result;
}

napi_value ArkJS::createArray() {
    napi_value result;
    napi_create_array(m_env, &result);
    return result;
}

napi_value ArkJS::createArray(std::vector<napi_value> values) {
    napi_value result;
    napi_create_array(m_env, &result);
    for (size_t i = 0; i < values.size(); i++) {
        napi_set_element(m_env, result, i, values[i]);
    }
    return result;
}

std::vector<napi_value> ArkJS::getCallbackArgs(napi_callback_info info) {
    size_t argc;
    napi_get_cb_info(m_env, info, &argc, nullptr, nullptr, nullptr);
    return getCallbackArgs(info, argc);
}

std::vector<napi_value> ArkJS::getCallbackArgs(napi_callback_info info, size_t args_count) {
    size_t argc = args_count;
    std::vector<napi_value> args(args_count, nullptr);
    napi_get_cb_info(m_env, info, &argc, args.data(), nullptr, nullptr);
    return args;
}

RNOHNapiObject ArkJS::getObject(napi_value object) {
    return RNOHNapiObject(*this, object);
}

RNOHNapiObject ArkJS::getObject(napi_ref objectRef) {
    return RNOHNapiObject(*this, this->getReferenceValue(objectRef));
}

napi_value ArkJS::getObjectProperty(napi_value object, std::string const &key) {
    return getObjectProperty(object, this->createString(key));
}

napi_value ArkJS::getObjectProperty(napi_value object, napi_value key) {
    napi_value result;
    auto status = napi_get_property(m_env, object, key, &result);
    this->maybeThrowFromStatus(status, "Failed to retrieve property from object");
    return result;
}

bool ArkJS::getBoolean(napi_value value) {
    bool result;
    auto status = napi_get_value_bool(m_env, value, &result);
    this->maybeThrowFromStatus(status, "Failed to retrieve boolean value");
    return result;
}

double ArkJS::getDouble(napi_value value) {
    double result;
    auto status = napi_get_value_double(m_env, value, &result);
    this->maybeThrowFromStatus(status, "Failed to retrieve double value");
    return result;
}

napi_value ArkJS::getArrayElement(napi_value array, uint32_t index) {
    napi_value result;
    auto status = napi_get_element(m_env, array, index, &result);
    this->maybeThrowFromStatus(status, "Failed to retrieve value at index");
    return result;
}

uint32_t ArkJS::getArrayLength(napi_value array) {
    uint32_t length;
    auto status = napi_get_array_length(m_env, array, &length);
    this->maybeThrowFromStatus(status, "Failed to read array length");
    return length;
}

std::vector<std::pair<napi_value, napi_value>> ArkJS::getObjectProperties(napi_value object) {
    napi_value propertyNames;
    auto status = napi_get_property_names(m_env, object, &propertyNames);
    this->maybeThrowFromStatus(status, "Failed to retrieve property names");
    uint32_t length = this->getArrayLength(propertyNames);
    std::vector<std::pair<napi_value, napi_value>> result;
    for (uint32_t i = 0; i < length; i++) {
        napi_value propertyName = this->getArrayElement(propertyNames, i);
        napi_value propertyValue = this->getObjectProperty(object, propertyName);
        result.emplace_back(propertyName, propertyValue);
    }
    return result;
}

std::string ArkJS::getString(napi_value value) {
    size_t length;
    napi_status status;
    status = napi_get_value_string_utf8(m_env, value, nullptr, 0, &length);
    this->maybeThrowFromStatus(status, "Failed to get the length of the string");
    std::string buffer(length, '\0');
    status = napi_get_value_string_utf8(m_env, value, buffer.data(), length + 1, &length);
    this->maybeThrowFromStatus(status, "Failed to get the string data");
    return buffer;
}

void ArkJS::maybeThrowFromStatus(napi_status status, const char *message) {
    if (status != napi_ok) {
        std::string msg_str = message;
        std::string error_code_msg_str = ". Error code: ";
        std::string status_str = std::to_string(status);
        std::string full_msg = msg_str + error_code_msg_str + status_str;
        auto c_str = full_msg.c_str();
        this->throwError(c_str);
    }
}

void ArkJS::throwError(const char *message) {
    napi_throw_error(m_env, nullptr, message);
    // stops a code execution after throwing napi_error
    throw std::runtime_error(message);
}

napi_valuetype ArkJS::getType(napi_value value) {
    napi_valuetype result;
    auto status = napi_typeof(m_env, value, &result);
    this->maybeThrowFromStatus(status, "Failed to get value type");
    return result;
}

folly::dynamic ArkJS::getDynamic(napi_value value) {
    switch (this->getType(value)) {
    case napi_undefined:
        return folly::dynamic(nullptr);
    case napi_null:
        return folly::dynamic(nullptr);
    case napi_boolean:
        return folly::dynamic(this->getBoolean(value));
    case napi_number:
        return folly::dynamic(this->getDouble(value));
    case napi_string:
        return folly::dynamic(this->getString(value));
    case napi_object: {
        bool isArray;
        auto status = napi_is_array(m_env, value, &isArray);
        assert(status == napi_ok);
        if (isArray) {
            auto arrayLength = this->getArrayLength(value);
            folly::dynamic result = folly::dynamic::array();
            for (uint32_t i = 0; i < arrayLength; ++i) {
                result.push_back(this->getDynamic(this->getArrayElement(value, i)));
            }
            return result;
        } else {
            folly::dynamic result = folly::dynamic::object();
            for (auto [key, val] : this->getObject(value).getKeyValuePairs()) {
                result[this->getString(key)] = this->getDynamic(val);
            }
            return result;
        }
    }
    default:
        return folly::dynamic(nullptr);
    }
}

std::vector<folly::dynamic> ArkJS::getDynamics(std::vector<napi_value> values) {
    std::vector<folly::dynamic> dynamics;
    for (auto value : values) {
        dynamics.push_back(this->getDynamic(value));
    }
    return dynamics;
}

std::vector<napi_value> ArkJS::convertIntermediaryValuesToNapiValues(std::vector<IntermediaryArg> args) {
    std::vector<napi_value> napiArgs;
    for (auto arg : args) {
        napiArgs.push_back(convertIntermediaryValueToNapiValue(arg));
    }
    return napiArgs;
}

napi_value ArkJS::convertIntermediaryValueToNapiValue(IntermediaryArg arg) {
    try {
        return this->createFromDynamic(std::get<folly::dynamic>(arg));
    } catch (const std::bad_variant_access &e) {
    }
    try {
        return this->createSingleUseCallback(std::move(std::get<IntermediaryCallback>(arg)));
    } catch (const std::bad_variant_access &e) {
    }
}

RNOHNapiObjectBuilder::RNOHNapiObjectBuilder(napi_env env, ArkJS arkJs) : m_env(env), m_arkJs(arkJs) {
    napi_value obj;
    napi_create_object(env, &obj);
    m_object = obj;
}

RNOHNapiObjectBuilder::RNOHNapiObjectBuilder(napi_env env, ArkJS arkJs, napi_value object) : m_env(env), m_arkJs(arkJs), m_object(object) {}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, napi_value value) {
    napi_set_named_property(m_env, m_object, name, value);
    return *this;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, int value) {
    napi_set_named_property(m_env, m_object, name, m_arkJs.createInt(value));
    return *this;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, facebook::react::Float value) {
    napi_set_named_property(m_env, m_object, name, m_arkJs.createDouble(value));
    return *this;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, char const *value) {
    napi_set_named_property(m_env, m_object, name, m_arkJs.createString(value));
    return *this;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, facebook::react::SharedColor value) {
    // for some unknown reason, (undefined) transparent colors don't work properly without this check, even though
    // there's basically the same check in colorComponentsFromColor
    if (!value)
        value = facebook::react::clearColor();
    auto colorComponents = colorComponentsFromColor(value);
    napi_value n_value;
    napi_create_array(m_env, &n_value);
    napi_set_element(m_env, n_value, 0, m_arkJs.createDouble(colorComponents.red));
    napi_set_element(m_env, n_value, 1, m_arkJs.createDouble(colorComponents.green));
    napi_set_element(m_env, n_value, 2, m_arkJs.createDouble(colorComponents.blue));
    napi_set_element(m_env, n_value, 3, m_arkJs.createDouble(colorComponents.alpha));
    napi_set_named_property(m_env, m_object, name, n_value);
    return *this;
}
RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, facebook::react::RectangleCorners<float> value) {
    napi_value n_value;
    napi_create_object(m_env, &n_value);

    napi_set_named_property(m_env, n_value, "topLeft", m_arkJs.createDouble(value.topLeft));
    napi_set_named_property(m_env, n_value, "topRight", m_arkJs.createDouble(value.topRight));
    napi_set_named_property(m_env, n_value, "bottomLeft", m_arkJs.createDouble(value.bottomLeft));
    napi_set_named_property(m_env, n_value, "bottomRight", m_arkJs.createDouble(value.bottomRight));
    napi_set_named_property(m_env, m_object, name, n_value);
    return *this;
}
RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, std::array<float, 16> matrix) {
    napi_value n_value;
    napi_create_array_with_length(m_env, matrix.size(), &n_value);

    for (std::size_t i = 0; i < matrix.size(); ++i) {
        napi_set_element(m_env, n_value, i, m_arkJs.createDouble(matrix[i]));
    }

    napi_set_named_property(m_env, m_object, name, n_value);
    return *this;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, std::string value) {
    napi_set_named_property(m_env, m_object, name, m_arkJs.createString(value));
    return *this;
}

RNOHNapiObjectBuilder &RNOHNapiObjectBuilder::addProperty(const char *name, folly::dynamic value) {
    napi_set_named_property(m_env, m_object, name, m_arkJs.createFromDynamic(value));
    return *this;
}

napi_value RNOHNapiObjectBuilder::build() {
    return m_object;
}

RNOHNapiObject::RNOHNapiObject(ArkJS arkJs, napi_value object) : m_arkJs(arkJs), m_object(object) {
}

napi_value RNOHNapiObject::getProperty(std::string const &key) {
    return m_arkJs.getObjectProperty(m_object, key);
}

napi_value RNOHNapiObject::getProperty(napi_value key) {
    return m_arkJs.getObjectProperty(m_object, key);
}

std::vector<std::pair<napi_value, napi_value>> RNOHNapiObject::getKeyValuePairs() {
    return m_arkJs.getObjectProperties(m_object);
}

bool ArkJS::isPromise(napi_value value) {
    bool result;
    napi_is_promise(m_env, value, &result);
    return result;
}

RNOHNapiObjectBuilder ArkJS::getObjectBuilder(napi_value object) {
    return RNOHNapiObjectBuilder(m_env, *this, object);
}

Promise::Promise(napi_env env, napi_value value) : m_arkJs(ArkJS(env)), m_value(value) {
}

Promise &Promise::then(std::function<void(std::vector<folly::dynamic>)> &&callback) {
    auto obj = m_arkJs.getObject(m_value);
    obj.call("then", {m_arkJs.createSingleUseCallback(std::move(callback))});
    return *this;
}

Promise &Promise::catch_(std::function<void(std::vector<folly::dynamic>)> &&callback) {
    auto obj = m_arkJs.getObject(m_value);
    obj.call("catch", {m_arkJs.createSingleUseCallback(std::move(callback))});
    return *this;
}
