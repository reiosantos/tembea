import * as shell from 'shelljs';

shell.cp('-R', 'src/assets', 'dist/src/assets');
shell.cp('-R', 'src/views', 'dist/src/views');
