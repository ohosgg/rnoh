#include "ArkJS.h"
#include "napi/native_api.h"
#include <string>

ArkJS::ArkJS(napi_env env) {
    this->env = env;
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

std::vector<napi_value> ArkJS::get_callback_args(napi_callback_info info, size_t args_count) {
    size_t argc = args_count;
    std::vector<napi_value> args(args_count, nullptr);
    napi_get_cb_info(env, info, &argc, args.data(), nullptr, nullptr);
    return args;
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

void ArkJS::throw_error(const char* message) {
    napi_throw_error(this->env, nullptr, message);
    // stops a code execution after throwing napi_error
    throw std::runtime_error(message);
}
