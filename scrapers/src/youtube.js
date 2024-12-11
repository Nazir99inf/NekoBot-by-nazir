const ytdl = require("ytdl-core");
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/(?:v|e(?:mbed)?)\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})|(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
const axios = require('axios');
const ytSearch = require('yt-search');

async function ytmp3(url) {
    try {
        const match = url.match(youtubeRegex);
        const videoId = match ? match[1] || match[2] : null;
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }
       const { videos } = await ytSearch(videoId);
        if (videos.length === 0) {
            throw new Error('Video not found');
        }
        const videoDetails = videos.find(a => a.videoId === videoId);
        let reso = [128];
        let result = {};

        while (true) {
            for (let i of reso) {
                const response = await axios.post('https://c.blahaj.ca/', {
                    url: url,
                    downloadMode: "audio"
                }, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                }).catch(e => e.response);
                 console.log(response.data);
                const data = response.data.url;
                if (data) {
                    result = data
                }
            }
            break;
        }

        return {
            metadata: {
                title: videoDetails.title,
                seconds: videoDetails.seconds,
                thumbnail: videoDetails.thumbnail,
                views: videoDetails.views.toLocaleString(),
                publish: videoDetails.ago,
                author: videoDetails.author,                
                url: videoDetails.url,
                description: videoDetails.description
            },
            download: await fetch(result).then(async(a) => Buffer.from(await a.arrayBuffer()))
        };
    } catch (error) {
        throw error;
    }
}

async function ytmp4(url) {
    try {
        const match = url.match(youtubeRegex);
        const videoId = match ? match[1] || match[2] : null;
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }
       const { videos } = await ytSearch(videoId);
        if (videos.length === 0) {
            throw new Error('Video not found');
        }
        const videoDetails = videos.find(a => a.videoId === videoId);
        let reso = [128];
        let result = {};

        while (true) {
            for (let i of reso) {
                const response = await axios.post('https://c.blahaj.ca/', {
                    url
                }, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                }).catch(e => e.response);
                 console.log(response.data);
                const data = response.data.url;
                if (data) {
                    result = data
                }
            }
            break;
        }

        return {
            metadata: {
                title: videoDetails.title,
                seconds: videoDetails.seconds,
                thumbnail: videoDetails.thumbnail,
                views: videoDetails.views.toLocaleString(),
                publish: videoDetails.ago,
                author: videoDetails.author,                
                url: videoDetails.url,
                description: videoDetails.description
            },
            download: await fetch(result).then(async(a) => Buffer.from(await a.arrayBuffer()))
        };
    } catch (error) {
        throw error;
    }
}

class Youtube {
   mp3 = async (url) => {
   try {
    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, {
        quality: 'highestaudio',
        filter: 'audioonly'
    });
    
    const audioPath = path.join('/tmp', `audio_${Date.now()}.webm`);
    const outputPath = path.join('/tmp', `output_${Date.now()}.mp3`);

    await new Promise((resolve, reject) => {
        ytdl(url, {
                format: audioFormat
            })
            .pipe(fs.createWriteStream(audioPath))
            .on('finish', resolve)
            .on('error', reject);
    });

    await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${audioPath} -vn -acodec libmp3lame ${outputPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error);
            }
            resolve(stdout);
        });
    });
    const { videoDetails } = info;  
    const fileData = fs.readFileSync(outputPath);

    await fs.promises.unlink(audioPath);
    await fs.promises.unlink(outputPath);

    return {
        metadata: {
            title: videoDetails.title,
            seconds: videoDetails.lengthSeconds,
            views: videoDetails.viewCount,
            likes: videoDetails.likes,
            thumbnail: videoDetails.thumbnails[2].url,
            author: videoDetails.author.name,
            description: videoDetails.description
        },
        download: fileData
    };
  } catch(e) {
    return ytmp3(url)
 }
};
 mp4 = async (url) => {
    try {
    const info = await ytdl.getInfo(url);
    let videoFormat = info.formats.find(f => (f.height === 720 || f.height === 360) && f.container === 'mp4');
    const audioFormat = ytdl.chooseFormat(info.formats, {
        quality: 'highestaudio',
        filter: 'audioonly'
    });

    if (!videoFormat) {
        videoFormat = ytdl.chooseFormat(info.formats, {
            quality: 'highestvideo',
            filter: 'videoonly'
        });
        if (!videoFormat) {
            throw new Error('Tidak ditemukan format video yang sesuai');
        }
    }
    if (!audioFormat) {
        throw new Error('Tidak ditemukan format audio');
    }

    const videoPath = path.join('/tmp', `video_${Date.now()}.mp4`);
    const audioPath = path.join('/tmp', `audio_${Date.now()}.mp4`);
    const outputPath = path.join('/tmp', `output_${Date.now()}.mp4`);

    await new Promise((resolve, reject) => {
        ytdl(url, {
                format: videoFormat
            })
            .pipe(fs.createWriteStream(videoPath))
            .on('finish', resolve)
            .on('error', reject);
    });

    await new Promise((resolve, reject) => {
        ytdl(url, {
                format: audioFormat
            })
            .pipe(fs.createWriteStream(audioPath))
            .on('finish', resolve)
            .on('error', reject);
    });

    await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${videoPath} -i ${audioPath} -c:v copy -c:a aac ${outputPath}`, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`ffmpeg error: ${error.message}`));
                return;
            }
            resolve();
        });
    });
    const buffer = fs.readFileSync(outputPath)
    await fs.promises.unlink(videoPath);
    await fs.promises.unlink(audioPath);

    const {
        videoDetails
    } = info;
     
    return {
        metadata: {
          title: videoDetails.title,
          seconds: videoDetails.lengthSeconds,
          views: videoDetails.viewCount,
          likes: videoDetails.likes,
          thumbnail: videoDetails.thumbnails[2].url,
          author: videoDetails.author.name,
          description: videoDetails.description
        },
      download: buffer
     };
    } catch(e) {
       return ytmp4(url);
    }
  }
  playlist = async (url) => {
      let response = await axios.post(
        "https://solyptube.com/findchannelvideo",
        `url=${url}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
            Referer:
              "https://solyptube.com/youtube-playlist-downloader#searchrResult",
          },
        },
      ).catch(e => e.response)
      let info = response.data;
      if (!info.data.title) return info
     return {
        metadata: {
          title: info.data.title,
          total: info.data.estimatedItemCount + " Videos",
          views: info.data.views,
          thumbnail: info.data.thumbnails[0].url,
          update: info.data.lastUpdated,
          author: info.data.author.name,
        },
        items: info.data.items.map((a) => ({
          title: a.title,
          duration: a.duration,
          url: a.shortUrl,
          thumbnail: a.thumbnails[0].url,
          author: a.author.name,
        })),
      }
   }
}

module.exports = new Youtube()
