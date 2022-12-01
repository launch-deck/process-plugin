#include <string>
#include <vector>
#include <Windows.h>

#ifndef WINDOW_H
#define WINDOW_H

class Window
{
private:
    std::string m_process;
    std::string m_windowName;
    int m_pid;
    HWND m_hWnd;

public:
    Window(std::string process, std::string windowName, int pid, HWND hWnd);
    std::string getProcess() { return m_process; }
    std::string getWindowName() { return m_windowName; }
    int getPid() { return m_pid; }
    HWND getHandle() { return m_hWnd; }
};

#endif

std::vector<Window> getWindows();
void focusWindow(int pid);
