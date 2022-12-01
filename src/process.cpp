#include <string>
#include <vector>
#include <iostream>
#include <Windows.h>
#include <Winuser.h>
#include "process.h"

Window::Window(std::string process, std::string windowName, int pid, HWND hWnd)
{
    m_process = process;
    m_windowName = windowName;
    m_pid = pid;
    m_hWnd = hWnd;
}

std::string ProcessIdToName(DWORD processId)
{
    std::string ret;
    HANDLE handle = OpenProcess(
        PROCESS_QUERY_LIMITED_INFORMATION,
        FALSE,
        processId /* This is the PID, you can find one from windows task manager */
    );
    if (handle)
    {
        DWORD buffSize = 1024;
        CHAR buffer[1024];
        if (QueryFullProcessImageNameA(handle, 0, buffer, &buffSize))
        {
            ret = buffer;
        }
        CloseHandle(handle);
    }
    return ret;
}

BOOL CALLBACK enumWindowCallback(HWND hWnd, LPARAM lparam)
{
    std::vector<Window> &windows = *reinterpret_cast<std::vector<Window> *>(lparam);

    int length = GetWindowTextLength(hWnd);
    TCHAR *buffer = new TCHAR[length + 1];
    GetWindowText(hWnd, buffer, length + 1);
    std::string windowTitle;

#ifndef UNICODE
    windowTitle = buffer;
#else
    std::wstring wStr = buffer;
    windowTitle = std::string(wStr.begin(), wStr.end());
#endif

    delete[] buffer;

    DWORD processID;
    DWORD actualProcId = GetWindowThreadProcessId(hWnd, &processID);
    std::string processName = ProcessIdToName(processID);

    // List visible windows with a non-empty title
    if (IsWindowVisible(hWnd) && length != 0)
    {
        Window window = Window::Window(processName, windowTitle, processID, hWnd);
        windows.push_back(window);
    }
    return TRUE;
}

std::vector<Window> getWindows()
{
    std::vector<Window> windows;
    ::EnumWindows(&enumWindowCallback, reinterpret_cast<LPARAM>(&windows));
    return windows;
}

void focusWindow(int pid)
{
    std::vector<Window> windows = getWindows();

    for (int i = 0; i < windows.size(); i++)
    {
        Window window = windows[i];

        if (window.getPid() == pid)
        {
            keybd_event(18, 0, 1, 0);
            keybd_event(18, 0, 1 | 2, 0);

            SwitchToThisWindow(window.getHandle(), true);
            break;
        }
    }
}
