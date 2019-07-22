#!/usr/bin/env python

# -=-=- Imports -=-=- #

import logging
import json

import math
import re
import shlex

from os import remove as remove_file
from os.path import join as path_join
from os.path import isfile as path_isfile
from os.path import expanduser as path_expanduser
import subprocess

# -=-=- Globals & Constants -=-=-  #
#

LOG = logging.getLogger('root');
#LOG.setLevel(logging.INFO);
#FH = logging.FileHandler('./bin/log.log');
#LOG.addHandler(FH);


# -=-=- Functions & Classes -=-=- #
#

def make_video (data):
	path = data['inpath'];
	outpath = data['outpath'];
	settingspath = path_expanduser(path_join(path, 'settings.json'));
	msg = 'Looking for storyboard in `%s`\n\tfile : `%s`\n'%(path, 'storyboard.md');
	print(msg);
	LOG.info(msg);
	#
	storyboard = None;
	settings = None;
	#
	if path_isfile(settingspath):
		with open(settingspath) as infile:
			settings = json.load(infile);
	else:
		settings = {
			'inpath':path,
			'outpath':outpath,
			'filename':'video.mov'
		};
	if 'filename' in data.keys(): settings['filename'] = data['filename'];
	#
	storyboard = Storyboard(path, settings);
	storyboard.prepare();
	storyboard.make();
	storyboard.cleanup();


# -=- Editor -=- #
#
class Editor ():
	def __init__(self, root_dir):
		self.root_dir = root_dir;
		#

	def rewrap_file(self, filename):
		filepath = path_join(self.root_dir, filename);
		tmp_path = path_join(self.root_dir, 'rewrap_tmp.mp4');
		cmd = 'ffmpeg -i %s (some stuff) %s';
		"""
		mv file to tmp file 
		ffmpeg hard copy rewrap thing command to filepath
		del tmp file
		"""
		#self._run_cmd(cmd);

	def make_slide_show_pdf(self, data):
		infile = path_join(self.root_dir, data['infile']);
		outfile = path_join(self.root_dir, data['outfile']);
		cmd = 'pandoc %s -t beamer -o %s'%(infile, outfile);
		msg = 'making file %s from %s'%(outfile, infile);
		LOG.info(msg);
		stdout, stderr = self._run_cmd(cmd);
	
	def make_slide_show_png(self, data):
		infile = path_join(self.root_dir, 'temp_%s'%(data['outfile']))+'.pdf';
		outfile = path_join(self.root_dir, data['outfile']);
		data['outfile'] = infile
		self.make_slide_show_pdf(data);
		cmd = 'pdftoppm %s %s -png'%(infile, outfile);
		msg = 'making file %s from %s'%(data['outfile'], data['infile']);
		LOG.info(msg);
		stdout, stderr = self._run_cmd(cmd);
		remove_file(infile);

	def png_to_mp4(self, data):
		infile = path_join(self.root_dir, data['infile']);
		outfile = path_join(self.root_dir, data['outfile']);
		duration = data['time'];
		cmd = 'ffmpeg -y -loop 1 -i %s -f lavfi -i aevalsrc=0 -t %d %s'%(infile, duration, outfile);
		stdout, stderr = self._run_cmd(cmd);

	def make_tts(self, data):
		string = data['string'];
		outfile = path_join(self.root_dir, data['outfile']);
		if 'speed' in data.keys():
			speed = '-s%d'%(data['speed']);
		else:
			speed = '-s150';
		cmd = 'echo "%s" | espeak -v en+f5 %s --stdout | ffmpeg -y -i - -ar 44100 -ac 2 -ab 192k -f mp3 %s'%(string, speed, outfile);
		msg = 'Writing string "%s" to file %s'%(string, data['outfile']);
		LOG.info(msg);
		stdout, stderr = self._run_cmd(cmd);

	def make_silence(self, data):
		duration = data['time'];
		outfile = path_join(self.root_dir, data['outfile']);
		cmd = 'ffmpeg -y -f lavfi -i aevalsrc=0:0::duration=%d -ab 320k %s'%(duration, outfile);
		msg = 'Writing silence to file %s'%(data['outfile']);
		LOG.info(msg);
		#
		stdout, stderr = self._run_cmd(cmd);

	def edit_vfx(self, data):
		infile = path_join(self.root_dir, data['infile']);
		outfile = path_join(self.root_dir, data['outfile']);
		vfx = data['vfx'];
		#
		garbage = [outfile];
		#
		extention = None;
		if infile.endswith('png'):
			extention = 'png';
		elif infile.endswith('jpg'):
			extention = 'jpg';
		#
		if extention != None:
			tmpfile = infile.replace('.%s'%(extention), '.mp4');
			self.png_to_mp4({
				'infile':infile,
				'outfile':tmpfile,
				'time':3
			});
			garbage.append(data['infile'].replace('.%s'%(extention), '.mp4'));
			infile = tmpfile;
		extention = 'mp4'
		#
		dur_cmd = 'ffprobe -v error -show_entries stream=duration -of default=noprint_wrappers=1:nokey=1 %s'%(infile);
		video_duration_str = self._run_cmd(dur_cmd)[0].split('\n')[0].strip();
		video_duration = float(video_duration_str);
		#
		fps_cmd = 'ffprobe -v 0 -of csv=p=0 -select_streams v:0 -show_entries stream=r_frame_rate %s'%(infile);
		video_fps_str = self._run_cmd(fps_cmd)[0].strip();
		video_fps = video_fps_str.split('/');
		video_fps = float(video_fps[0])/float(video_fps[1]);
		#
		video_frame_count = int(math.ceil(video_fps * video_duration));
		vf = [];
		#
		for fx in vfx:
			fx = fx.split('=');
			if fx[0] == 'fadein':
				if len(fx) == 1: fx.append('3');
				#
				t1 = 0;
				t2 = int(float(fx[1]));
				time = 'st=%d:d=%d'%(t1, t2);
				vf.append('fade=in:%s'%(time));
			elif fx[0] == 'fadeout':
				if len(fx) == 1: fx.append('3');
				t2 = int(float(fx[1]));
				t1 = video_duration - t2;
				time = 'st=%d:d=%d'%(t1, t2);
				vf.append('fade=out:%s'%(time))
			else:
				pass;
		#
		LOG.info('duration : %s\nframe count : %s\nfps : %d'%(video_duration, video_frame_count, video_fps));
		
		if len(vf) > 0:
			vf = " -vf '%s'"%(','.join(vf));
		else:
			vf = ''
		LOG.info('%s %s'%(data['infile'], vf));
		
		cmd = "ffmpeg -y -i %s%s -c:v libx264 -crf 22 -preset veryfast %s"%(infile, vf, outfile);
		stdout, stderr = self._run_cmd(cmd); # change it so i can see the progress
		#
		self.rewrap_file(outfile);
		return garbage;

	def edit_afx(self, data):
		infile = path_join(self.root_dir, data['infile']);
		outfile = path_join(self.root_dir, data['outfile']);
		afx = data['afx'];
		#
		garbage = [];
		mix = [(infile, 0)];
		ordnal = 0;
		for fx in afx:
			fx = fx.split('=');
			if fx[0] == 'before':
				if len(fx) == 1: fx.append('3');
				outf = 'before_%d.mp3'%(ordnal);
				garbage.append(outf);
				self.make_silence({
					'outfile':outf,
					'time': int(fx[1])
				})
				ordnal += 1;
				mix.append((outf, -1));
			elif fx[0] == 'after':
				if len(fx) == 1: fx.append('3');
				outf = 'after_%d.mp3'%(ordnal);
				garbage.append(outf);
				self.make_silence({
					'outfile':outf,
					'time': int(fx[1])
				})
				ordnal += 1;
				mix.append((outf, 1));
			else:
				pass;
		#
		mix.sort(key=lambda r:r[1]);
		mix = [i[0].replace(self.root_dir, '') for i in mix];
		self.concat_audio({
			'infiles' : mix,
			'outfile': outfile
		})
		#
		for filename in garbage:
			remove_file(path_join(self.root_dir, filename));
		#print(mix);
	
	def replace_audio(self, data):
		audiofile = path_join(self.root_dir, data['audiofile']);
		videofile = path_join(self.root_dir, data['videofile']);
		outfile = path_join(self.root_dir, data['outfile']);
		#
		msg = 'merging audio : %s and video : %s into file : %s'%(data['audiofile'], data['videofile'], data['outfile']);
		#print(msg);
		LOG.info(msg);
		#
		cmd = 'ffmpeg -y -i %s -i %s -c:v copy -map 0:v:0 -map 1:a:0 %s'%(videofile, audiofile, outfile);
		self._run_cmd(cmd);


	def trim_video(self, data):
		pass;

	def concat_video(self, data):
		infiles = [path_join(self.root_dir, i) for i in data['infiles']];
		outfile = path_join(self.root_dir, data['outfile']);
		#splice_types = data['type'];
		#
		LOG.info(infiles);
		msg = 'contatinating videos : %s into %s'%(', '.join(data['infiles']), data['outfile']);
		#print(msg);
		LOG.info(msg);
		#
		concat_file = path_join(self.root_dir, 'concat.txt');
		with open(concat_file, 'w+') as cfile:
			for filepath in infiles:
				cfile.write("file '%s'\n"%(filepath));
		cmd = 'ffmpeg -y -f concat -safe 0 -i %s -c:v copy %s'%(concat_file, outfile);
		stdout, stderr = self._run_cmd(cmd);

	def concat_audio(self, data):
		infiles = [path_join(self.root_dir, i) for i in data['infiles']];
		outfile = path_join(self.root_dir, data['outfile']);
		#
		msg = 'contatinating audio : %s into %s'%(', '.join(data['infiles']), data['outfile']);
		#print(msg);
		LOG.info(msg);
		#
		cmd = 'ffmpeg -y -i concat:"%s" -codec copy %s'%('|'.join(infiles), outfile);
		stdout, stderr = self._run_cmd(cmd);
		#
		self.rewrap_file(outfile);

	def edit_audio(self, data):
		pass;

		# fade in

		# fade out

		# concat audio clips (optional delay)

		# add bg music with clip fade out


	def _run_cmd(self, cmd):
		p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE    );
		stdout, stderr = p.communicate();
		return stdout.decode("utf-8"), stderr.decode("utf-8");



# -=- Storyboard -=- #
#
class Storyboard ():
	def __init__(self, filepath, settings):
		self.root_dir = filepath;
		self.filepath = path_join(filepath, 'storyboard.md');
		self.editor = Editor(filepath);
		self.settings = settings;
		#
		self.slides = [];
		self.garbage = [];
		self.textdata = '';
		#
		if path_isfile(self.filepath):
			with open(self.filepath) as infile:
				#self.textdata = infile.read();
				i = 0;
				self.slides.append({
					'textdata':'',
					'tag_data':{}
				});
				for line in infile:
					if line.startswith('# '):
						i+=1;
						self.slides.append({
							'textdata':'',
							'tag_data':{}
						});
					self.slides[i]['textdata'] += line;
					self.textdata += line;
		else:
			msg = 'No file found!\n\tPlease place a `storyboard.md` file in the directory you want to make a video in.';
			print(msg);
			LOG.info(msg);
		#
		LOG.info(self.slides);

	def prepare(self):
		pass;
		"""
		Sudo Code:

		- compile pdf and convert to slide images
		- find all show tags and compile the videos (including their slide)
		- find all say tags amd compile the audio
		- match all show and say tags with their matches
		- compile all clips (mix the show and say tags)
		- splice the clips together
		"""
		# compile md into pdf images
		#filepath = self.filepath;
		#outpath = 'pres.pdf';
		#cmd = 'pandoc %s -t beamer -o %s'%(filepath, outpath);
		# run `cmd`
		# convert pdf to images

		tags = ['show', 'say', 'read', 'play', 'credits'];
		
		# Extract tag data/
		for i in range(len(self.slides)):
			slide = self.slides[i];
			# regex out the files
			matches = re.findall('<(.*?)>', slide['textdata']);
			order = 0;
			if matches:
				for match in matches:
					tag_data = match.split(' ');
					tag = tag_data.pop(0);
					tag_data = ' '.join(tag_data);
					if tag in tags:
						if not tag in self.slides[i]['tag_data'].keys():
							self.slides[i]['tag_data'][tag] = [];
						self.slides[i]['tag_data'][tag].append([order, tag_data]);
						order+=1;
			#
		#
		LOG.info(self.slides);
		#
		self._compile_tags();
		#
	
	def make(self):
		self.editor.make_slide_show_png({
			'infile':'storyboard.md',
			'outfile':'slides'
		});
		mix = [];
		#
		for i in range(len(self.slides)):
			slide = self.slides[i];
			#print(slide.keys());
			cmp_data = {
				'tag_data': slide['cmp_data'],
				'slide_num':i,
				'slide_path': path_join(self.editor.root_dir, 'slides_%d'%(i)),
				'slide':slide
			};
			filename = self._make_slide(cmp_data);
			mix.append(filename);
		#
		for filename in mix: self.garbage.append(filename);
		#
		#print (mix);
		#
		self.editor.concat_video({
			'infiles':mix,
			'outfile':'video.mov'
		});

	def cleanup(self):
		print('removing garbage files...');
		self.garbage.append('concat.txt');
		for filename in self.garbage:
			LOG.info('removing file : %s'%(filename));
			if path_isfile(path_join(self.root_dir, filename)):
				remove_file(path_join(self.root_dir, filename));
		#	

	def _make_slide(self, cmp_data):
		#
		msg = 'Making slide_%d'%(cmp_data['slide_num']+1);
		print(msg);
		LOG.info(msg);
		#
		slide_number = cmp_data['slide_num'];
		slide_filein = 'slides-%d.png'%(slide_number+1);
		slide_tmp = 'slides-%d.mp4'%(slide_number+1);
		slide_filename = 'slide_%d.mp4'%(slide_number+1);
		self.editor.png_to_mp4({
			'infile':slide_filein, 
			'outfile': slide_tmp,
			'time':3
		});
		garbage = [slide_filein, slide_tmp];
		mix = [{
			'type':'v',
			'filename':slide_tmp,
			'order_num':-1
		}];
		#
		for (tag, tdata) in cmp_data['tag_data'].items():
			print('\t%s :'%(tag));
			if tag == 'show':
				for i in range(len(tdata)):
					merger = [];
					for j in range(len(tdata[i]['tag_data'])):
						filename = 'show_%d_%d_%d.mp4'%(slide_number, i, j);
						data = tdata[i]['tag_data'][j];
						print('\t\t%s'%(filename));
						garbage.append(filename);
						#
						g = self.editor.edit_vfx({
							'infile' : data['filename'],
							'outfile' : filename,
							'vfx' : data['vfx']
						});
						[garbage.append(_item_) for _item_ in g];
						merger.append(filename);
					#
					filename = 'show_%d_%d.mp4'%(slide_number, i);
					print('\t\t%s'%(filename));
					garbage.append(filename);
					#
					self.editor.concat_video({
						'infiles' : merger,
						'outfile' : filename
					})
					mix.append({
						'type':'v',
						'filename':filename,
						'order_num':tdata[i]['order_num']
					});
					#
			elif tag == 'say':
				for i in range(len(tdata)):
					#LOG.info(tdata[i]);
					data = tdata[i]['tag_data'][0];
					filename = 'say_%d_%d_0.mp3'%(slide_number, i);
					outfile = 'say_%d_%d.mp3'%(slide_number, i);
					data['filename'] = filename;
					print('\t\t%s'%(outfile));
					garbage.append(outfile);
					garbage.append(filename);
					#
					self.editor.make_tts({
						'string' : data['string'],
						'outfile' : filename,
						'speed':data['speed']
					});
					self.editor.edit_afx({
						'infile' : filename,
						'outfile' : outfile,
						'afx' : data['afx']
					})
					mix.append({
						'type':'a',
						'filename':outfile,
						'order_num':tdata[i]['order_num']
					});
			elif tag == 'read':
				for i in range(len(tdata)):
					data = tdata[i]['tag_data'][0];
					filename = data['filename'];
					part_index = data['index'];
					outfile = 'read_%d_%d.mp3'%(slide_number, i);
					textdata = '';
					try:
						with open(path_join(self.root_dir, filename)) as infile:
							textdata = infile.read().split('---')[part_index];
							# remove comment lines from textdata
							textdata = re.sub('^#.*?$\s*?^', '', textdata, flags=re.MULTILINE);
					except IOError as e:
						print('error: file %s not found!!'%(filename));
						#print(e);
					#
					a_val = 0;
					b_val = 0;
					linedata = []
					ordnal = 0;
					tmp_mix = [];
					speed = 15;
					#
					for match in re.finditer('<.*?>', textdata):
						span = match.span();
						b_val = span[0];
						#
						string = textdata[a_val:b_val].strip();
						after = 0;
						for fxdata in textdata[span[0]+1:span[1]-1].split(' '):
							fxdata = fxdata.split('=');
							if len(fxdata) == 1:
								if fxdata[0] == 'pause':
									after = 2;
								elif fxdata[0] == 'speed':
									speed = 15;
							else:
								if fxdata[0] == 'pause':
									after = int(fxdata[1]);
								elif fxdata[0] == 'speed':
									speed = int(fxdata[1]);
						tmpfile1 = 'read_%d_%d_%d_0.mp3'%(slide_number, i, ordnal);
						tmpfile2 = 'read_%d_%d_%d.mp3'%(slide_number, i, ordnal);
						garbage.append(tmpfile1);
						garbage.append(tmpfile2);
						ordnal += 1;
						self.editor.make_tts({
							'string':string,
							'outfile':tmpfile1,
							'speed':speed*10
						});
						if after > 0:
							self.editor.edit_afx({
								'infile':tmpfile1,
								'outfile':tmpfile2,
								'afx':['after=%d'%(after)]
							})
							tmp_mix.append(tmpfile2);
						else:
							tmp_mix.append(tmpfile1);
						#
						a_val = span[1];
					b_val = len(textdata);
					#
					string = textdata[a_val:b_val].strip();
					tmpfile = 'read_%d_%d_%d_0.mp3'%(slide_number, i, ordnal);
					garbage.append(tmpfile);
					ordnal += 1;
					self.editor.make_tts({
						'string':string,
						'outfile':tmpfile,
					});
					tmp_mix.append(tmpfile);
					#
					self.editor.concat_audio({
						'infiles':tmp_mix,
						'outfile':outfile
					});
					mix.append({
						'type':'a',
						'filename':outfile,
						'order_num':tdata[i]['order_num']
					});
					#
					print('\t\t%s'%(outfile));
					LOG.info('making read : %s : %s'%(filename, outfile));
			else:
				print('unknown tag : %s'%(tag));
		#
		msg = 'combining files for slide # %d into slide_%d.mp4'%(slide_number, slide_number);
		print(msg);
		#
		mix.sort(key=lambda r:r['order_num']);
		#
		for i in range(len(mix)):
			typ = mix[i]['type'];
			filename = mix[i]['filename'];
			print('\t%d : %s : %s'%(mix[i]['order_num'], typ, filename));
			garbage.append(filename);
		#
		mix_v = [i for i in range(len(mix)) if (mix[i]['type']=='v')];
		#
		mix_q = [mix[mix_v[i-1]:mix_v[i]] for i in range(1,len(mix_v))];
		mix_q.append(mix[mix_v[-1] : len(mix)]);
		#
		mix_f = [];
		ordnal = 0;
		#
		for item in mix_q:
			if len(item) == 1:
				# only video
				mix_f.append(item[0]['filename']);
			elif len(item) == 2:
				# video and audio
				filename = 'mix_%d.mp4'%(ordnal);
				ordnal += 1;
				garbage.append(filename);
				self.editor.replace_audio({
					'audiofile':item[1]['filename'],
					'videofile':item[0]['filename'],
					'outfile':filename
				})
				mix_f.append(filename);
			elif len(item) > 2:
				# video and audio that needs to concat
				audiofile = 'mix_%d.mp3'%(ordnal);
				ordnal += 1;
				garbage.append(audiofile);
				self.editor.concat_audio({
					'infiles':[i['filename'] for i in item[1:len(item)]],
					'outfile':audiofile
				});
				#
				filename = 'mix_%d.mp4'%(ordnal);
				ordnal += 1;
				garbage.append(filename);
				self.editor.replace_audio({
					'audiofile':audiofile,
					'videofile':item[0]['filename'],
					'outfile':filename
				});
				mix_f.append(filename);
			#
			LOG.info('\t%s'%(str(item)));
		#
		#print(','.join(mix_f));
		self.editor.concat_video({
			'infiles':mix_f,
			'outfile':slide_filename
		})
		#
		for filename in garbage:
			self.garbage.append(filename);
		#
		return slide_filename;

	def _compile_tags(self):
		for i in range(len(self.slides)):
			LOG.info('compiling slide %d'%(i+1));
			CMP_DATA = {};
			for key in self.slides[i]['tag_data'].keys():
				if key in ['show', 'say', 'read', 'show', 'credits']:
					data = [[j[0], shlex.split(j[1])] for j in self.slides[i]['tag_data'][key]];
					self.slides[i]['tag_data'][key] = data;
				#
				tag_data = self.slides[i]['tag_data'][key];
				#
				if key == 'show':
					for items in tag_data:
						data = {
							'filename':None,
							'vfx':[]
						};
						cmp_data = []
						for item in items[1]:
							if item.split('=')[0] in ['fadein', 'fadeout']:
								data['vfx'].append(item);
							elif (item.endswith('.mp4') or item.endswith('.png') or item.endswith('.mov')):
								data['filename'] = item;
								cmp_data.append(data);
								data = {
									'filename':None,
									'vfx':[]
								};
						#	
						items.append(cmp_data);
					#
								
				elif key == 'say':
					for items in tag_data:
						data = {
							'string':items[1][0],
							'afx':[],
							'speed':15*10
						};
						for j in range(1, len(items[1])):
							item = items[1][j];
							if item.split('=')[0] in ['before', 'after']:
								data['afx'].append(item);
							elif item.split('=')[0] in ['speed']:
								s = item.split('=');
								if len(s) == 2:
									data['speed'] = int(s[1])*10;
						items.append([data]);
				elif key == 'read':
					for items in tag_data:
						part_index = 0;
						if len(items[1]) > 1: part_index = items[1][1];
						data = {
							'filename':items[1][0],
							'index':int(part_index)
						};
						items.append([data]);
				elif key == 'show':
					for items in tag_data:
						data = {
							'filename':items[1][0]
						};
						items.append([data]);
				elif key == 'credits':
					for items in tag_data:
						data = {
							'filename':items[1][0]
						};
						items.append([data]);
				else:
					print('unknown tag : %s'%(key));
					#continue;
				#
				CMP_DATA[key] = [{
					'order_num':item[0],
					'tag_data':item[-1]
				} for item in tag_data];
				#
			self.slides[i]['cmp_data'] = CMP_DATA
			#
			for (key, value) in self.slides[i]['cmp_data'].items():
				LOG.info('\t%s :'%(key));
				for item in value:
					LOG.info('\t\t%s'%(str(item)));




# -=-=- MAIN -=-=- #
#
def main():
	pass;
#
if __name__ == '__main__':
	main();
## EOF
