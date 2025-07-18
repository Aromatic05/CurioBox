import * as path from 'path';

export const ENTRYDIR = path.dirname((require.main?.filename ?? __dirname));
