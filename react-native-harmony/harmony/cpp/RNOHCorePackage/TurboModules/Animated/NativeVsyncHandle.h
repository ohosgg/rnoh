#include <native_vsync/native_vsync.h>
#include <string>

namespace rnoh {

class NativeVsyncHandle {
public:
    explicit NativeVsyncHandle(std::string &&name) : m_name(std::move(name)) {
        m_nativeVSync = OH_NativeVSync_Create(m_name.data(), m_name.size());
    }

    NativeVsyncHandle(NativeVsyncHandle &&other) noexcept : m_name(std::move(other.m_name)), m_nativeVSync(other.m_nativeVSync) {
        other.m_nativeVSync = nullptr;
    }

    NativeVsyncHandle &operator=(NativeVsyncHandle &&other) noexcept {
        if (this != &other) {
            OH_NativeVSync_Destroy(m_nativeVSync);
            m_name = std::move(other.m_name);
            m_nativeVSync = other.m_nativeVSync;
            other.m_nativeVSync = nullptr;
        }
        return *this;
    }

    // no copy
    NativeVsyncHandle(const NativeVsyncHandle &) = delete;
    NativeVsyncHandle &operator=(const NativeVsyncHandle &) = delete;

    ~NativeVsyncHandle() {
        if (m_nativeVSync != nullptr) {
            OH_NativeVSync_Destroy(m_nativeVSync);
        }
    }

    void requestFrame(OH_NativeVSync_FrameCallback callback, void *data) {
        OH_NativeVSync_RequestFrame(m_nativeVSync, callback, data);
    }

    std::string m_name;
    OH_NativeVSync *m_nativeVSync = nullptr;
};

} // namespace rnoh
