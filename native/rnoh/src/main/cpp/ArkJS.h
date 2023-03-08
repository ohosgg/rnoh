#include "napi/native_api.h"
#include <array>
#include <vector>
#include <string>

#ifndef native_ArkJS_H
#define native_ArkJS_H

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
    
    napi_value get_double(double init_value);
    
    napi_value get_undefined();
    
    napi_value get_reference_value(napi_ref ref);
    
    napi_ref create_reference_value(napi_value value);
    
    void throw_error(const char* message);
    
    std::vector<napi_value> get_callback_args(napi_callback_info info, size_t args_count);
    
    private:
    napi_env env;
    
    void maybe_throw_from_status(napi_status status, const char* message);
};

#endif //native_ArkJS_H