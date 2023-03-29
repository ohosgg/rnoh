#ifndef native_ArkJS_H
#define native_ArkJS_H

#include "napi/native_api.h"
#include <array>
#include <vector>
#include <string>
#include <react/renderer/graphics/Float.h>
#include <react/renderer/graphics/Color.h>

class RNOHNapiObjectBuilder;
class ArkJS {
  public:
    ArkJS(napi_env env);

    template <size_t args_count>
    napi_value call(napi_value callback, std::array<napi_value, args_count> args) {
        napi_value result;
        auto status = napi_call_function(this->env, nullptr, callback, args.size(), args.data(), &result);
        this->maybe_throw_from_status(status, "Couldn't call a callback");
        return result;
    }

    napi_env get_env();

    napi_value get_double(double init_value);

    napi_value get_undefined();

    RNOHNapiObjectBuilder createObjectBuilder();

    napi_value get_reference_value(napi_ref ref);

    napi_ref create_reference_value(napi_value value);

    napi_value createArray();

    napi_value createArray(std::vector<napi_value>);

    void throw_error(const char *message);

    std::vector<napi_value> get_callback_args(napi_callback_info info, size_t args_count);

    napi_value createString(std::string const &str);

    napi_value getObjectProperty(napi_value object, std::string const &key);
    napi_value getObjectProperty(napi_value object, napi_value key);

    double getDouble(napi_value value);

    napi_value getArrayElement(napi_value array, uint32_t index);

    uint32_t getArrayLength(napi_value array);

    std::string getString(napi_value value);
    
  private:
    napi_env env;

    void maybe_throw_from_status(napi_status status, const char *message);
};

class RNOHNapiObjectBuilder {
  public:
    RNOHNapiObjectBuilder(napi_env env, ArkJS *arkJs);

    RNOHNapiObjectBuilder& addProperty(const char *name, napi_value value);

    RNOHNapiObjectBuilder& addProperty(const char *name, int value);

    RNOHNapiObjectBuilder& addProperty(const char *name, facebook::react::Float value);

    RNOHNapiObjectBuilder& addProperty(const char *name, char const *value);

    RNOHNapiObjectBuilder& addProperty(const char *name, facebook::react::SharedColor value);

    RNOHNapiObjectBuilder& addProperty(const char *name, std::string value);

    napi_value build();

  private:
    ArkJS *m_arkJs;
    napi_env m_env;
    napi_value m_object;
};

#endif //native_ArkJS_H