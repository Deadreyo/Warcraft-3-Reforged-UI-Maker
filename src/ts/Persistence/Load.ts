import { OpenDialogReturnValue, remote, SaveDialogReturnValue } from "electron";
import { readFile } from "original-fs";
import { ICallableDivInstance } from "../Classes & Functions/ICallableDivInstance";
import { Editor } from "../Editor/Editor";
import SaveContainer from "./SaveContainer";

export default class Load implements ICallableDivInstance{

    public load(filepath : string) : void{

        readFile(filepath, (err, data)=>{
            if(err != null){
                console.error("Failed opening file: " + err.message);
            }else if(data != null){

                const loadData = new SaveContainer(data.toString());
                Editor.GetDocumentEditor().projectTree.load(loadData);

            }
        });

    }
    
    public Run() : void{

        const openParams = remote.dialog.showOpenDialog({
            filters: [ {name: 'JSON', extensions: ['json'] } ],
            properties: [ 'openFile'] });    

        openParams.then((openData : OpenDialogReturnValue) => {

            if(openData.canceled) return;
            this.load(openData.filePaths[0])

        });

    }

}