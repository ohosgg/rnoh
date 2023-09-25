#ifndef native_ArkJS_H
#define native_ArkJS_H

#include "napi/native_api.h"
#include <array>
#include <vector>
#include <string>
#include <functional>
#include <variant>
#include <folly/dynamic.h>
#include <react/renderer/graphics/Float.h>
#include <react/renderer/graphics/Color.h>
#include <react/renderer/graphics/RectangleCorners.h>

class RNOHNapiObjectBuilder;
class RNOHNapiObject;

class ArkJS {
  public:
    using IntermediaryCallback = std::function<void(std::vector<folly::dynamic>)>;
    using IntermediaryArg = std::variant<folly::dynamic, IntermediaryCallback>;

    ArkJS(napi_env env);

    template <size_t args_count>
    napi_value call(napi_value callback, std::array<napi_value, args_count> args, napi_value thisObject = nullptr) {
        napi_value result;
        auto status = napi_call_function(m_env, thisObject, callback, args.size(), args.data(), &result);
        this->maybeThrowFromStatus(status, "Couldn't call a callback");
        return result;
    }

    napi_value call(napi_value callback, std::vector<napi_value> args, napi_value thisObject = nullptr);

    napi_value call(napi_value callback, const napi_value *args, int argsCount, napi_value thisObject);

    napi_value createBoolean(bool value);

    napi_value createInt(int value);

    napi_value createDouble(double value);

    napi_value createString(std::string const &str);

    napi_ref createReference(napi_value value);

    void deleteReference(napi_ref reference);

    napi_value createSingleUseCallback(std::function<void(std::vector<folly::dynamic>)> &&callback);

    napi_value createArray();

    napi_value createArray(std::vector<napi_value>);

    std::vector<napi_value> createFromDynamics(std::vector<folly::dynamic>);

    napi_value createFromDynamic(folly::dynamic);

    RNOHNapiObjectBuilder createObjectBuilder();

    bool isPromise(napi_value);

    RNOHNapiObjectBuilder getObjectBuilder(napi_value object);

    napi_value getUndefined();

    napi_value getNull();

    napi_value getReferenceValue(napi_ref ref);

    std::vector<napi_value> getCallbackArgs(napi_callback_info info);

    std::vector<napi_value> getCallbackArgs(napi_callback_info info, size_t args_count);

    RNOHNapiObject getObject(napi_value object);

    RNOHNapiObject getObject(napi_ref object);

    napi_value getObjectProperty(napi_value object, std::string const &key);

    napi_value getObjectProperty(napi_value object, napi_value key);

    bool getBoolean(napi_value value);

    double getDouble(napi_value value);

    int getInteger(napi_value value);

    napi_value getArrayElement(napi_value array, uint32_t index);

    uint32_t getArrayLength(napi_value array);

    std::vector<uint8_t> getArrayBuffer(napi_value array);

    std::vector<std::pair<napi_value, napi_value>> getObjectProperties(napi_value object);

    std::string getString(napi_value value);

    folly::dynamic getDynamic(napi_value value);

    std::vector<folly::dynamic> getDynamics(std::vector<napi_value> values);

    napi_env getEnv();

    void throwError(const char *message);

    napi_valuetype getType(napi_value value);

    napi_value convertIntermediaryValueToNapiValue(IntermediaryArg arg);

    std::vector<napi_value> convertIntermediaryValuesToNapiValues(std::vector<IntermediaryArg> args);

  private:
    napi_env m_env;

    void maybeThrowFromStatus(napi_status status, const char *message);
};

class RNOHNapiObject {
  public:
    RNOHNapiObject(ArkJS arkJs, napi_value object);

    template <size_t args_count>
    napi_value call(std::string const &key, std::array<napi_value, args_count> args) {
        return m_arkJs.call(this->getProperty(key), args, m_object);
    }

    napi_value call(std::string const &key, std::vector<napi_value> args) {
        return m_arkJs.call(this->getProperty(key), args, m_object);
    }

    napi_value call(std::string const &key, const napi_value *args, int argsCount) {
        return m_arkJs.call(this->getProperty(key), args, argsCount, m_object);
    }

    napi_value getProperty(std::string const &key);

    napi_value getProperty(napi_value key);

    std::vector<std::pair<napi_value, napi_value>> getKeyValuePairs();

  private:
    ArkJS m_arkJs;
    napi_value m_object;
};

class RNOHNapiObjectBuilder {
  public:
    RNOHNapiObjectBuilder(napi_env env, ArkJS arkJs);

    RNOHNapiObjectBuilder(napi_env env, ArkJS arkJs, napi_value object);

    RNOHNapiObjectBuilder &addProperty(const char *name, napi_value value);

    RNOHNapiObjectBuilder &addProperty(const char *name, bool value);

    RNOHNapiObjectBuilder &addProperty(const char *name, int value);

    RNOHNapiObjectBuilder &addProperty(const char *name, std::array<float, 16> matrix);

    RNOHNapiObjectBuilder &addProperty(const char *name, facebook::react::Float value);

    RNOHNapiObjectBuilder &addProperty(const char *name, char const *value);

    RNOHNapiObjectBuilder &addProperty(const char *name, facebook::react::SharedColor value);

    RNOHNapiObjectBuilder &addProperty(const char *name, facebook::react::RectangleCorners<float> value);

    RNOHNapiObjectBuilder &addProperty(const char *name, std::string value);

    RNOHNapiObjectBuilder &addProperty(const char *name, folly::dynamic value);

    napi_value build();

  private:
    ArkJS m_arkJs;
    napi_env m_env;
    napi_value m_object;
};

class Promise {
  public:
    Promise(napi_env env, napi_value value);

    Promise &then(std::function<void(std::vector<folly::dynamic>)> &&callback);
    Promise &catch_(std::function<void(std::vector<folly::dynamic>)> &&callback);

  private:
    ArkJS m_arkJs;
    napi_value m_value;
};

#endif // native_ArkJS_H