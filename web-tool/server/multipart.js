// server/multipart.js
// Zero-dependency multipart/form-data parser for a single file field.
// Reads the raw request body buffer and extracts the first file part.
// Works for uploads up to ~50 MB in memory (sufficient for .docx files).

/**
 * Parse a multipart/form-data request containing one file field.
 *
 * @param {import('http').IncomingMessage} req
 * @param {{ maxBytes?: number }} [opts]
 * @returns {Promise<{ fieldname: string, originalname: string, mimetype: string, buffer: Buffer, fields: Record<string,string> }>}
 */
export function parseMultipart(req, opts = {}) {
  const maxBytes = opts.maxBytes || 52_428_800; // 50 MB default

  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
    if (!boundaryMatch) {
      return reject(new Error('No multipart boundary in Content-Type'));
    }
    const boundary = boundaryMatch[1].replace(/^"(.*)"$/, '$1');

    const chunks = [];
    let total = 0;

    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        req.destroy();
        reject(new Error(`Upload exceeds ${maxBytes} bytes limit`));
        return;
      }
      chunks.push(chunk);
    });

    req.on('error', reject);

    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks);
        const result = extractParts(body, boundary);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  });
}

/**
 * Extract file and text parts from a raw multipart body Buffer.
 * @param {Buffer} body
 * @param {string} boundary
 */
function extractParts(body, boundary) {
  const sep = Buffer.from(`--${boundary}`);
  const end = Buffer.from(`--${boundary}--`);
  const CRLF = Buffer.from('\r\n');
  const CRLFCRLF = Buffer.from('\r\n\r\n');

  let file = null;
  const fields = {};

  let pos = 0;

  while (pos < body.length) {
    // Find next boundary
    const boundaryIdx = indexOfBuf(body, sep, pos);
    if (boundaryIdx === -1) break;

    // Skip past the boundary + CRLF
    pos = boundaryIdx + sep.length;

    // Check for terminal boundary
    if (body.slice(pos, pos + 2).equals(Buffer.from('--'))) break;

    // Skip CRLF after boundary
    if (body.slice(pos, pos + 2).equals(CRLF)) pos += 2;

    // Find header/body separator
    const headerEnd = indexOfBuf(body, CRLFCRLF, pos);
    if (headerEnd === -1) break;

    const headerBuf = body.slice(pos, headerEnd);
    const headerStr = headerBuf.toString('utf8');
    pos = headerEnd + 4; // skip \r\n\r\n

    // Find next boundary (marks end of this part's body)
    const nextBoundary = indexOfBuf(body, sep, pos);
    const partEnd = nextBoundary !== -1 ? nextBoundary - 2 : body.length; // -2 for CRLF before boundary
    const partBody = body.slice(pos, partEnd);
    pos = partEnd;

    // Parse headers
    const headers = {};
    for (const line of headerStr.split('\r\n')) {
      const colon = line.indexOf(':');
      if (colon > -1) {
        headers[line.slice(0, colon).trim().toLowerCase()] = line.slice(colon + 1).trim();
      }
    }

    const disp = headers['content-disposition'] || '';
    const nameMatch = disp.match(/\bname="([^"]*)"/);
    const filenameMatch = disp.match(/\bfilename="([^"]*)"/);
    const fieldname = nameMatch ? nameMatch[1] : '';
    const filename = filenameMatch ? filenameMatch[1] : null;
    const mimetype = headers['content-type'] || 'application/octet-stream';

    if (filename) {
      // File part — store the last file found
      file = {
        fieldname,
        originalname: filename,
        mimetype,
        buffer: partBody
      };
    } else if (fieldname) {
      // Text field
      fields[fieldname] = partBody.toString('utf8');
    }
  }

  if (!file) throw new Error('No file part found in multipart body');

  return { ...file, fields };
}

/**
 * Find the index of needle Buffer inside haystack Buffer starting from offset.
 */
function indexOfBuf(haystack, needle, offset = 0) {
  const nLen = needle.length;
  const hLen = haystack.length;
  outer: for (let i = offset; i <= hLen - nLen; i++) {
    for (let j = 0; j < nLen; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}
