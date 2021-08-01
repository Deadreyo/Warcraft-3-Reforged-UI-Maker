/* eslint-disable @typescript-eslint/no-explicit-any */
import { debugText } from "../../Classes & Functions/Mini-Functions";
import { FrameComponent } from "./FrameComponent";
import { Editor } from "../Editor";
import Saveable from "../../Persistence/Saveable";
import SaveContainer from "../../Persistence/SaveContainer";
import { TextFunctions } from "../../Classes & Functions/TextFunctions";
import FrameBaseContent from "./FrameBaseContent";

export class CustomText extends FrameBaseContent implements Saveable {

    public static readonly SAVE_KEY_TEXT = "text";
    public static readonly SAVE_KEY_SCALE = "scale";
    public static readonly SAVE_KEY_COLOR = "color";

    private text: string //= "Text Frame";
    private scale: number // = 1;
    private color: string//= "#FFFFFF";

    public getElement() : HTMLDivElement{
        return this.element as HTMLDivElement;
    }

    public getScale() : number{
        return this.scale;
    }

    public setScale(val: number): void {
        if (val <= 0) {
            debugText("Scale can't be zero or less")
            return;
        }
        this.scale = val;
        this.element.style.fontSize = (val) * Editor.GetDocumentEditor().workspaceImage.getBoundingClientRect().width / 100 + "px"
        debugText("Scale changed.")
    }

    public getColor() : string{
        return this.color;
    }

    public setColor(val: string): void {
        this.element.style.color = val
        this.color = val
        debugText("Color changed.")
    }

    public getText() : string{
        return this.text;
    }

    public SetText(Text: string): void {
        this.text = Text;
        this.element.innerText = Text;
    }

    constructor(frameComponent: FrameComponent, width: number, height: number, x: number, y: number, text : string, color : string, scale : number) {

        try {

            const element = document.createElement('div');
            super(frameComponent, element, width, height, x, y);

            this.SetText(text);
            this.setColor(color);
            this.setScale(scale);

            this.element.style.wordBreak = "break-word"
            this.element.style.overflowY = "hidden"
            this.element.style.userSelect = "none";
            this.element.style.lineHeight = "1";

            TextFunctions(this);

            (this.element as any).customText = this;

        } catch (e) { alert(e) }
    }

    save(container: SaveContainer): void {

        container.save(CustomText.SAVE_KEY_TEXT, this.text);
        container.save(CustomText.SAVE_KEY_SCALE, this.scale);
        container.save(CustomText.SAVE_KEY_COLOR, this.color);

    }

    public delete(): void {

        this.element.remove()
        Editor.GetDocumentEditor().projectTree.Select(null);

        debugText("Deleted CustomText Object")
    }

    public static GetCustomTextFromHTMLDivElement(divElement: HTMLDivElement): CustomText {
        return (divElement as any).customText;
    }

}