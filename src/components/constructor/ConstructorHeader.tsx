import Link from "next/link";
import ThemeSwitch from "../ThemeSwitch";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"

interface ConstructorHeaderProps {
  onNewCanvas?: () => void;
  onSave?: () => void;
  onExportJSON?: () => void;
  onExportSVG?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  onToggleSidebar?: () => void;
  onToggleLayersbar?: () => void;
}

export default function ConstructorHeader({
  onNewCanvas,
  onSave,
  onExportJSON,
  onExportSVG,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  showGrid = false,
  onToggleGrid,
  onToggleSidebar,
  onToggleLayersbar,
}: ConstructorHeaderProps) {
  return (
    <header className="bg-white dark:bg-black shadow-sm dark:border-b dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link className="text-xl dark:text-gray-100" href="/">locate it</Link>
          
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={onNewCanvas}>
                  New Canvas
                </MenubarItem>
                <MenubarItem onClick={onSave}>
                  Save <MenubarShortcut>⌘S</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>Share</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>Link</MenubarItem>
                    <MenubarItem>Email</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />
                <MenubarItem onClick={onExportJSON}>
                  Export to JSON
                </MenubarItem>
                <MenubarItem onClick={onExportSVG}>
                  Export to SVG
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={onUndo}>
                  Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={onRedo}>
                  Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={onCut}>Cut</MenubarItem>
                <MenubarItem onClick={onCopy}>Copy</MenubarItem>
                <MenubarItem onClick={onPaste}>Paste</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>View</MenubarTrigger>
              <MenubarContent>
                <MenubarCheckboxItem checked={showGrid} onCheckedChange={onToggleGrid}>
                  Show Grid
                </MenubarCheckboxItem>
                <MenubarSeparator />
                <MenubarItem inset onClick={onToggleSidebar}>
                  Hide Sidebar
                </MenubarItem>
                <MenubarItem inset onClick={onToggleLayersbar}>
                  Hide Layersbar
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        <nav className="flex items-center">
          <ul className="flex space-x-2 mr-2">
            <li>
              <Link
                href="/constructor"
                className="text-sm text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Constructor
              </Link>
            </li>
            <li>
              <Link
                href="/docs"
                className="text-sm text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Docs
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-sm text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
          {/* <ThemeSwitch /> */}
        </nav>
      </div>
    </header>
  );
}