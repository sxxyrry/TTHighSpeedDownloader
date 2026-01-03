import wx # pyright: ignore[reportMissingTypeStubs]


class Notice():
    def __init__(self, app: wx.App | None = None):
        if app is None:
            self.app = wx.App(False)
        else:
            self.app = app

    def _show_popup(self, title: str, message: str, icon: int, style: int):
        popup = wx.MessageDialog(None, message, title, style | icon)
        popup.ShowModal()
        popup.Destroy()

    def EmitNotice_New(self, title: str, message: str, style: int = wx.OK):
        """普通通知 - 使用信息图标"""
        self._show_popup(title, message, wx.ICON_INFORMATION, style)

    def EmitWarningNotice_New(self, title: str, message: str, style: int = wx.OK):
        """警告通知 - 使用警告图标"""
        self._show_popup(title, message, wx.ICON_WARNING, style)

    def EmitErrorNotice_New(self, title: str, message: str, style: int = wx.OK):
        """错误通知 - 使用错误图标"""
        self._show_popup(title, message, wx.ICON_ERROR, style)

def main():
    # app = wx.App(False)
    # frame = MainFrame()
    # frame.Show()
    notice = Notice()
    notice.EmitNotice_New('a', 'b')
    notice.EmitWarningNotice_New('a', 'b')
    notice.EmitErrorNotice_New('a', 'b')
    # app.MainLoop()

if __name__ == "__main__":
    main()
