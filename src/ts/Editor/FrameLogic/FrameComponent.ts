import { CustomImage } from "./CustomImage";
import { FrameBuilder } from "./FrameBuilder";
import { FrameType } from "./FrameType";

export class FrameComponent{

    private children : FrameComponent[];
    public readonly image : CustomImage;
    public readonly treeElement : HTMLElement;

    private name : string;

    public GetName() : string{
        return this.name;
    }

    public SetName(newName : string){
        this.name = newName;
        (this.treeElement.firstChild as HTMLElement).innerText = newName;
    }

    public type : FrameType;

    public constructor(frameBuildOptions : FrameBuilder){
        
        let ul : HTMLElement = document.createElement('ul');
        let li : HTMLElement = document.createElement('li');
        
        li.innerText = frameBuildOptions.name;
        ul.append(li);

        this.type = frameBuildOptions.type;
        this.name = frameBuildOptions.name;
        this.treeElement = ul;
        this.children = [];
        this.image = new CustomImage(this,frameBuildOptions.texture,frameBuildOptions.width, frameBuildOptions.height, frameBuildOptions.x, frameBuildOptions.y);
        
        (ul as any).frameComponent = this;

    }

    public Append(childFrame : FrameComponent){

        this.children.push(childFrame);
        this.treeElement.append(childFrame.treeElement);

    }

    public RemoveChild(childFrame : FrameComponent){

        let index = this.children.indexOf(childFrame);

        if(index == -1){

            for(let child of this.children){

                child.RemoveChild(childFrame);

            }

            return;
        }

        childFrame.RemoveAll();

        this.treeElement.removeChild(childFrame.treeElement);
        this.children.slice(index, 1);
        if(this.image != null) this.image.Delete();
        
    }

    public RemoveAll(){

        for(let child of this.children){
            child.RemoveAll();
            child.treeElement.remove();
            if(this.image != null) this.image.Delete();
        }

        this.children = [];

    }

    public static GetFrameComponent(ProjectTreeElement : HTMLElement) : FrameComponent{

        return (ProjectTreeElement as any).frameComponent;

    }

    public GetChildren() : FrameComponent[]{
        return this.children;
    }

    public GetParent() : FrameComponent{

        return FrameComponent.GetFrameComponent(this.treeElement.parentElement);

    }
}