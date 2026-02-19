import React, { useEffect, useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { searchPlugin } from '@react-pdf-viewer/search';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';

const HighlightPDFViewer = ({ fileUrl, highlightQuote }) => {
    
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const searchPluginInstance = searchPlugin();
    
    // 1. EXTRACTION: Pull the jumpToNextMatch function out of the plugin
    const { highlight, jumpToNextMatch, clearHighlights } = searchPluginInstance;
    
    const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);

    useEffect(() => {
        let timeoutId;

        if (isDocumentLoaded && highlightQuote) {
            // Clear previous highlights before searching a new one
            clearHighlights();

            const cleanSnippet = highlightQuote.trim().substring(0, 30);
            
            if (cleanSnippet.length > 5) {
                // 2. HIGHLIGHT: Find and paint the text
                highlight(cleanSnippet);
                
                // 3. SCROLL: Wait just enough for the text layer to process the search, then jump!
                timeoutId = setTimeout(() => {
                    jumpToNextMatch();
                }, 400); // 400ms is the sweet spot for PDF.js to catch up
            }
        }

        // Cleanup the timeout if the user clicks a new quote really fast
        return () => clearTimeout(timeoutId);
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightQuote, isDocumentLoaded]); 

    return (
        <div className="h-full w-full">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
                    onDocumentLoad={() => setIsDocumentLoaded(true)}
                    transformGetDocumentParams={(options) => 
                        Object.assign({}, options, {
                            standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
                        })
                    }
                />
            </Worker>
        </div>
    );
};

export default HighlightPDFViewer;