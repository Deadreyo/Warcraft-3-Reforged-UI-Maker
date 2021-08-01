/* eslint-disable @typescript-eslint/no-explicit-any */
import { Editor } from "../Editor";
import { CustomImage } from "./CustomImage";
import { FrameBuilder } from "./FrameBuilder";
import { FrameType } from "./FrameType";
import Saveable from "../../Persistence/Saveable";
import SaveContainer from "../../Persistence/SaveContainer";
import { CustomText } from "./CustomText";
import FrameBaseContent from "./FrameBaseContent";

export class FrameComponent implements Saveable {

    public static readonly SAVE_KEY_NAME = "name";
    public static readonly SAVE_KEY_CHILDREN = "children";
    public static readonly SAVE_KEY_TRIGGER_VARIABLE_NAME = "trig_var";
    public static readonly SAVE_KEY_TYPE = "type";

    private children: FrameComponent[];
    private trigVar: string;
    public readonly custom: FrameBaseContent;
    public readonly treeElement: HTMLElement;
    public parentOption: HTMLOptionElement;

    private name: string;
    public GetName(): string {
        return this.name;
    }

    public SetName(newName: string): void {
        this.name = newName;
        (this.treeElement.firstChild as HTMLElement).innerText = newName;
        if (this.parentOption) this.parentOption.text = newName;
    }

    public setTrigVar(VarName: string): void {
        this.trigVar = VarName
    }

    public getTrigVar(): string {
        return this.trigVar;
    }

    public type: FrameType;

    public constructor(frameBuildOptions: FrameBuilder) {
        try {

            const ul: HTMLElement = document.createElement('ul');
            const li: HTMLElement = document.createElement('li');

            li.innerText = frameBuildOptions.name;
            ul.append(li);

            this.type = frameBuildOptions.type;
            this.name = frameBuildOptions.name;
            this.treeElement = ul;
            this.children = [];
            if (this.type == FrameType.TEXT_FRAME)
                this.custom = new CustomText(this, frameBuildOptions.width, frameBuildOptions.height, frameBuildOptions.x, frameBuildOptions.y, frameBuildOptions.text, frameBuildOptions.color, frameBuildOptions.scale);
            else
                this.custom = new CustomImage(this, frameBuildOptions.width, frameBuildOptions.height, frameBuildOptions.x, frameBuildOptions.y, frameBuildOptions.texture, frameBuildOptions.wc3Texture);

            this.parentOption = document.createElement('option');
            this.parentOption.text = this.name;

            console.log("Again, needs to be a cleaner way to doing 'as any' fetching.");
            (ul as any).frameComponent = this;

            li.onclick = () => {
                Editor.GetDocumentEditor().projectTree.Select(this);
            }

        } catch (e) { alert('FrameComp Const: ' + e) }
    }

    save(container: SaveContainer): void {

        container.save(FrameComponent.SAVE_KEY_NAME, this.name);
        container.save(FrameComponent.SAVE_KEY_TYPE, this.type);
        container.save(FrameComponent.SAVE_KEY_TRIGGER_VARIABLE_NAME, this.trigVar);
        this.custom.save(container);

        const childrenSaveArray = [];

        for (const child of this.children) {

            const childSaveContainer = new SaveContainer(null);
            child.save(childSaveContainer);
            childrenSaveArray.push(childSaveContainer);

        }

        if (childrenSaveArray.length > 0)
            container.save(FrameComponent.SAVE_KEY_CHILDREN, childrenSaveArray);

    }

    private AppendFrame(frame: FrameComponent): void {

        this.children.push(frame);
        this.treeElement.append(frame.treeElement);

    }

    public RemoveFrame(whatFrame: FrameComponent): boolean {

        const childIndex = this.children.indexOf(whatFrame);

        if (childIndex == -1) return false;

        this.children.splice(childIndex, 1);

        return true;

    }

    public CreateAsChild(newFrame: FrameBuilder): FrameComponent {
        const newChild = new FrameComponent(newFrame);

        this.AppendFrame(newChild);

        return newChild;
    }

    public Destroy(): void {

        const parent = this.GetParent();
        parent.RemoveFrame(this);

        for (const child of this.children) {
            parent.AppendFrame(child);
        }

        this.treeElement.remove();
        if (this.custom != null) this.custom.delete();
        if (this.parentOption != null) this.parentOption.remove();

        Editor.GetDocumentEditor().parameterEditor.UpdateFields(null);
    }

    public MakeParentTo(newChild: FrameComponent): boolean {

        if (newChild == this) return false;

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let traverseNode: FrameComponent = this;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let previousNode: FrameComponent = this;

        do {

            if (traverseNode == newChild) {

                newChild.RemoveFrame(previousNode);
                newChild.GetParent().AppendFrame(previousNode);

                break;
            }

            previousNode = traverseNode;
            traverseNode = traverseNode.GetParent();

        } while (traverseNode != null);

        newChild.GetParent().RemoveFrame(newChild);
        this.AppendFrame(newChild);

    }

    public static GetFrameComponent(ProjectTreeElement: HTMLElement): FrameComponent {

        console.log("'As any' fetching of frameComponents from HTMLElements");
        return (ProjectTreeElement as any).frameComponent;

    }

    public GetChildren(): FrameComponent[] {
        return this.children;
    }

    public GetParent(): FrameComponent {
        return FrameComponent.GetFrameComponent(this.treeElement.parentElement);
    }
}