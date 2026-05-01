const fs=require('fs');
const path=require('path');


async function fileReaderWriter(){
    try{
        const inputPath=path.join(__dirname, 'input.txt');
        const data= await fs.promises.readFile(inputPath,'utf-8');

        const lines=data.trim().split('\n');
        const totalLines=lines.length;

        const totalWords = lines.reduce((count, line) => 
            count + line.trim().split(/\s+/).filter(Boolean).length, 0);

    const output = `Total Lines: ${totalLines}\nTotal Words: ${totalWords}`;

    const outputPath = path.join(__dirname, 'output.txt');
    await fs.promises.writeFile(outputPath, output, 'utf-8');

    console.log('Output file updated successfully!');
    console.log(output);

  } catch(err){
    if(err.code ==='ENOENT'){
        console.error('Error: input file does not exist')
    }
    else{
        console.error('Error:', err.message)
    }

  }
}

fileReaderWriter();












