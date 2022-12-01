#include <napi.h>
#include <string>
#include <vector>
#include "process.h"

void focusWindowNapi(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int pid = (int)info[0].ToNumber().Int32Value();
    focusWindow(pid);
}

Napi::Value getWindowsNapi(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    std::vector<Window> result = getWindows();

    Napi::Array windowArray = Napi::Array::New(info.Env(), result.size());
    for (int i = 0; i < result.size(); i++)
    {
        Window window = result[i];
        Napi::Object obj = Napi::Object::New(info.Env());

        obj.Set("process", window.getProcess());
        obj.Set("windowName", window.getWindowName());
        obj.Set("pid", window.getPid());

        windowArray[i] = obj;
    }

    return windowArray;
}

// callback method when the module is registered with Node.js
Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    // set a key on `exports` object
    exports.Set(
        Napi::String::New(env, "focusWindow"),      // key
        Napi::Function::New(env, focusWindowNapi)); // value
    exports.Set(
        Napi::String::New(env, "getWindows"),      // key
        Napi::Function::New(env, getWindowsNapi)); // value

    // return `exports` object (always)
    return exports;
}

// register `process` module which calls `Init` method
NODE_API_MODULE(process, Init)
